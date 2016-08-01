Meteor.publish('printers', function(limit){
    console.log("published?");
    return Printers.find({});
});
