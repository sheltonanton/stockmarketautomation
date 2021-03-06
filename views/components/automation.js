const event_url = "/events";

async function login(){
    result = await send_api('/zerodha', 'post', {'Content-Type': 'application/json'}, JSON.stringify(parse_form(document.getElementById('login'))))
    if(result.status == "success"){
        change_status_loggedin({loggedin: true})
        let data = {}
        r = await send_api('/auto/instruments','post', {'Content-Type':"application/json"}, JSON.stringify(data))
        let source = r.data.stocks.map(stock => {
            return {value: stock[0],label: stock[1]}
        })
    }
}
async function isloggedin(){
    response = await send_api('/zerodha/isloggedin', 'get')
    change_status_loggedin(response.loggedin)
    return response
}
function change_status_loggedin(status){
    ele = document.getElementById('form_loggedin')
    if (ele && status) {
        ele.innerHTML = (status) ? "Logged in successfully" : "Not yet logged in"
        ele.style.color = (status) ? "green" : "red"
    }
}

/* AUTOMATION */
async function auto_get_autologin(id){
    let cb = document.getElementById(id)
    let result = await send_api('/properties/autoLogin', 'get')
    let value = false
    if(result.property) value = (result.property['value'] == 'true') ? true: false
    cb.checked = value
}

async function auto_set_autologin(id){
    let cb = document.getElementById(id)    
    let value = cb.checked;
    let data = {
        key: 'autoLogin',
        value: value.toString()
    }
    result = await send_json('/property', 'put', JSON.stringify({property: data}))
    if(result.data.n == 0) send_json('/property', 'post', JSON.stringify({property: data}))
}

function auto_write_display(data) {
    let status = data.status
    display = document.getElementById("automation-display")
    let p = document.createElement('p')
    let time = new Date().toLocaleString().split(', ')[1];
    if(status == "success"){
        p.style.color = "green"
        p.innerHTML = `${time}: ${data.message}`
    }else if(status == "error"){
        p.style.color = "red"
        p.innerHTML = `${time}: ${data.error}`
    }
    display.prependChild(p);
}
function auto_start_streaming(){
    return new Promise((resolve, reject) => {
        auto_start_streaming = function(){
            data = JSON.stringify({status :"ws_started"})
            resolve(data)
            return data
        }
    })
}

async function auto_start_process(){
    result = await send_api('/auto/start_automation', 'get')
}

async function auto_simulate(input) {
    input = document.getElementById(input)
    data = (input.value.includes('to'))? input.value.split(' to ') : input.value.split(',')
    result = await send_json('/auto/simulate', 'post', JSON.stringify({
        data: data
    }))
}

async function auto_backtest(input) {
    input = document.getElementById(input)
    data = input.value.split(',')
    result = await send_json('/auto/backtest', 'post', JSON.stringify({
        data: data
    }))
    auto_backtest_display_result(result)
}
async function auto_backtest_display_result(result){
    var display = document.getElementById('backtest_display')
    var report = result.report;
    for(var r of report){
        var row = document.createElement('p');
        row.innerHTML = `<div>${r.strategy}</div>`;
        var content = document.createElement('ul');
        var stocks = {}
        for(var t of r.trades){
            let diff = (t['exitPrice'] - t['entryPrice']) * ((t['type'] == 'buy')? 1: -1)
            if(!stocks[t['stock']]) stocks[t['stock']] = {profit: 0, loss: 0}
            if(diff > 0){
                stocks[t['stock']].profit = stocks[t['stock']].profit + diff
            }else{
                stocks[t['stock']].loss = stocks[t['stock']].loss + diff
            }
        }
        for(var s in stocks){
            var li = document.createElement('li');
            li.innerHTML = `
                Stock: ${s}, Profit: ${stocks[s]['profit']}, Loss: ${stocks[s]['loss']}
            `
            content.appendChild(li);
        }
        row.appendChild(content);
        display.appendChild(row);
    }
}

async function auto_stop_process(){
    result = await send_api('/auto/stop_automation', 'get')
}
async function auto_force_stop(){
    result = await send_api('/auto/force_stop', 'get')
}
async function auto_subscribe(input){
    input = document.getElementById(input)
    result = await send_json('/auto/subscribe', 'post', JSON.stringify({stocks: input.value.split(',')}))
}

/* ORDER DATA */
async function order_get_data(table, resDiv){
    let data = await send_api('/order/bo','get')
    data = data['data']
    let columns = ['stock','type','entryPrice','exitPrice','entryTime','exitTime']
    columns = columns.map(column => {return {data: column, title: column}})
    $.fn.dataTable.ext.errMode = 'none';
    let total_profit = 0
    let total_loss = 0
    let invested = 0
    let traded = 0
    data.forEach(d => {
        if(d['exitPrice']){
            invested = invested + parseFloat(d['entryPrice']) * parseInt(d['quantity'])
            traded = traded + (parseFloat(d['entryPrice']) + parseFloat(d['exitPrice'])) * parseInt(d['quantity'])
            let diff = (parseFloat(d['exitPrice']) - parseFloat(d['entryPrice'])) * ((d['type'] == 'buy')? 1: -1)
            let r = parseInt(d['quantity']) * diff
            if(r < 0){total_loss+=r}else{total_profit+=r}
        }
        d['entryTime'] = new Date(parseInt(d['entryTime']+'000')).toTimeString().split(' GMT')[0]
        d['exitTime'] = new Date(parseInt(d['exitTime']+'000')).toTimeString().split(' GMT')[0]
    })
    let net = total_profit + total_loss
    let d = document.getElementById(resDiv)
    d.innerHTML = `
        <table style="width:75%;margin:60px auto;" cellpadding="3">
            <tr><td>Total Profit</td><td>: ${total_profit.toFixed(2)}</td></tr>
            <tr><td>Total Loss</td><td>: ${-total_loss.toFixed(2)}</td></tr>
            <tr><td>Net</td><td>: ${net.toFixed(2)}</td></tr>
            <tr><td>Inv. Amt</td><td>: ${invested.toFixed(0)}</td></tr>
            <tr><td>Traded Amt</td><td>: ${traded.toFixed(0)}</td></tr>
        </table>
    `
    $(`#${table}`).DataTable({data,columns, paging: false, scrollY: 150, autoWidth: true,
        rowCallback: function (row, data, index) {
            result = (data['exitPrice'] - data['entryPrice']) * ((data['type']=="buy")? 1:-1)
            $(row).css({'background-color':(result >0)? '#caf8d6': '#f5ced9'})
        }
    })

}

/* OPEN RANGE BREAKOUT */
async function save_orb_stocks(name){
    data = tokenFieldGetData(name);
    result = await send_json('/stocks', 'post', JSON.stringify({stocks: data}))
    //success
}
async function add_orb_stock(name){
    result = await send_json('/stocks', 'post', JSON.stringify({stock: name}))
}
async function get_orb_stocks(){
    result = await send_api('/stocks', 'get')
    args = result.stocks.map(r => {
        return [r.name, delete_orb_stock]
    })
    tokenFieldPopulate('orb', args)
}
async function delete_orb_stock(stock){
    result = await send_api('/stocks?name='+stock, 'delete')
}

/* USER MANAGER */
function ms_toggleUserView(index){
    ids = ['ms_addUser', 'ms_showUsers']
    ids.forEach(id => {
        document.getElementById(id).style.display = "none";
    })
    document.getElementById('ms_form_addUser').reset()
    document.getElementById(index).style.display = "block";
}
async function ms_addUser(form){
    data = parse_form(form)
    result = await send_json('/users','post', JSON.stringify({user: data}))
    ms_showUsers('ms_showUsers')
    ms_toggleUserView('ms_showUsers')
}
async function ms_showUsers(id){
    let display = document.getElementById(id);
    display.removeChildren()
    result = await send_api('/users', 'get');
    result.users.forEach(user => {
        let p = document.createElement('p')
        p.innerHTML = (store['logged_user'] == user.userId)? user.userId+" (L)": user.userId;
        p.setAttribute('data-value', user.userId)
        p.id = "user-"+user.userId;
        p.ondblclick = function(){
            ms_setMaster(this.parentNode, this.id);
        }
        p.onmousedown = function(){if (event.detail > 1) event.preventDefault();}
        display.prependChild(p)
        if(user.master){
            ms_highlightMaster(display, p.id);
        }
    })

}
async function ms_setMaster(parent, id){
    result = await send_json('/users/master/'+id.split('-')[1], 'put', JSON.stringify({}))
    //send the master user to db
    result['status'] == "success" && ms_highlightMaster(parent, id)
}
function ms_highlightMaster(parent, id){
    parent.childNodes.forEach(node => {
        if (node.id == id) {
            node.style['background-color'] = "#d1f8d1"
            node.style['color'] = "green"
        } else {
            node.style['background-color'] = "white"
            node.style['color'] = "black"
        }
    })
}

//       /* * * * * * * * * * * \

//      |    |            |      |   
//      |          _             |   


//      |     \           /      |   
//      |       --------         |   

//       \_ _ _ _ _ _ _ _ _ _ _ /

function funImageInit(){
    img = document.getElementById('fun_image')
    fz = 120
    img.width = 28 * fz
    img.height = 18 * fz
    img.onclick = function(){
        nextImage.bind(img)()
    }
    function nextImage () {
        let fx = -(Math.round(Math.random() * 28) - 1)
        let fy = -(Math.round(Math.random() * 18) - 1)
        fx = (fx == 1) ? 0 : fx;
        fy = (fy == 1) ? 0 : fy;
        if ((fx == -4 && fy == -7) || (fx <= -17 && fy == -17)) {
            setTimeout(this.click.bind(this), 0)
            return;
        }

        this.style.left = `${fx * fz}px`
        this.style.top = `${fy * fz}px`
    }

    function auto_image(){
        nextImage.bind(this)();
        setTimeout(auto_image.bind(this), 2000)
    }
    setTimeout(auto_image.bind(img), 2000)
}

/* MAIN */
var store = {};

(async function(){
    var source = new EventSource(event_url);
    source.onmessage = function(event){
        let data = event.data;
        switch(data.status){
            case "loggedIn": {
                change_status_loggedin(true)
                userId = data.message;
                var d = document.getElementById('user-' + userId)
                if (d) {
                    d.innerHTML = d.innerHTML + ' (L)'
                } else {
                    store['logged_user'] = userId
                }
                data.message = "Logged in successfully"
                data.status = "success";
                break;
            }
            case 'warning':
            case 'error':
            case 'success':
                {
                    auto_write_display(data);
                    break;
                }
        }
    }
    setTimeout(isloggedin, 0)
}());
