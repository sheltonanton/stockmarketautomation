function formSubmitted(form) {
    data = parse_form(form)
}

function createTokenEntry(value, delete_cb) {
    let p = document.createElement('p')
    p.className = "token_field--entry"
    p.setAttribute('data-value', value)

    let div = document.createElement('div')
    div.className = "token_field--ent"
    div.innerHTML = value

    let button = document.createElement('button')
    button.className = "token_field--icon"
    button.innerHTML = "X"
    button.onclick = function () {
        delete_cb(value)
        this.parentNode.remove()
    }
    p.appendChild(div)
    p.appendChild(button)
    return p
}

function tokenFieldKeyPress(input, add_cb, delete_cb) {
    if (event.key == "Enter") {
        name = input.name
        value = input.value
        display = document.getElementById(name)
        let p = createTokenEntry(value, delete_cb)
        display.prependChild(p)
        add_cb(value)
        input.value = ""
    }
}

function tokenFieldGetData(name) {
    display = document.getElementById(name)
    let entries = [],
        childNodes = display.childNodes
    childNodes.forEach(node => {
        entries.push(node.dataset.value)
    })
    return entries
}

function tokenFieldPopulate(name, args) {
    display = document.getElementById(name)
    args.forEach(arg => {
        p = createTokenEntry(...arg)
        display.appendChild(p);
    })
}