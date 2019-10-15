const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/stock_auto', {
    useNewUrlParser: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.on('open', function(){
    var schema = new mongoose.Schema({
        name: String
    })
    //compiling schema into model
    var Inventory = mongoose.model('inventory', schema);
    //creating a document with model
    var kranberry = new Inventory({name: "KranBerry"})
    console.log(kranberry.name)
    //creating a method for schema
    schema.methods.speak = function(){
        var greeting = this.name ? `Meow, my name is ${this.name}`: `I don't have a name, Meow`;
        console.log(greeting)
    }
    Inventory = mongoose.model('inventory', schema);
    var fluffy = new Inventory({name: "Fluffy"})
    console.log(fluffy)

    //saving fluffy to database
    fluffy.save(function(err, kittens){
        if(err) return console.log(err);
        console.log(kittens);
    })
    kranberry.save(function(err, kittens){
        if(err) return console.log(err);
        console.log(kittens)
    })

})