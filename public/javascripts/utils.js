function parse_form(form){
    var result = {}
    Array.from(form.elements).forEach(element => {
        if(element.name){
            result[element.name] = element.value
        }
    })
    return result;
}

async function send_api(url, method, headers, body) {
    result = await fetch(url, {
        method: method,
        headers: headers || {},
        body: body || null
    })
    return result.json()
}

function send_json(url, method, data){
    return send_api(url, method, {
        'Content-Type': "application/json"
    }, data)
}

//polyfill
Node.prototype.prependChild = function(child){
    if(this.firstChild){
        this.insertBefore(child, this.firstChild)
    }else{
        this.appendChild(child)
    }
}

Node.prototype.removeChildren = function(){
    while (this.hasChildNodes()) {
        this.removeChild(this.lastChild);
    }
}