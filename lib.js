Printers = new Mongo.Collection("Printers");

Meteor.methods({
    removeAllPrinters: function(){
        return Printers.remove({});
    }
});