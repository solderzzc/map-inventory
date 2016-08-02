//var svg = d3.select("#htmlEmbed").append("svg:image")
//    .attr("src","/public/1.svg")
    //.attr('preserveAspectRatio')
    //.attr("width", 1000)
    //.attr("height", 1000);
var current_coords = new ReactiveVar();
var svg;
var map_ready = new ReactiveVar(false);
var selected_printer_id = new ReactiveVar();
var selected_circle;

Template.floorplan.onRendered( function() {
    map_ready.set(false);
    d3.select("htmlEmbed").classed("svg-container", true);

    d3.xml("/1.svg", function (xml) {
        document.getElementById("htmlEmbed").appendChild(xml.documentElement);
        svg = d3.selectAll("svg");
        //console.log(svg);
        svg.attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", "0 0 1870 1210");

        var current_circle;
        svg.on("click", function () { //TODO: Move into meteor event? cant do that
            current_coords.set(d3.mouse(this));

            if(!!selected_circle){ //TODO: change this into a function or something
                selected_circle.style("fill", "purple");
                selected_circle = null
                //selected_printer_id.set(null); //undo
            }

            if (!!current_circle) {
                current_circle.remove();
            }
            //TODO: Remember not to delete it once we actually save it!
            current_circle = svg.append("circle")
                .attr("cx", d3.mouse(this)[0])
                .attr("cy", d3.mouse(this)[1])
                .attr("r", 16).style("fill", "red");
            selected_printer_id.set(null);

        });
        map_ready.set(true);


    });
});
/*
Template.floorplan.events({

    'click circle': function(event){
        event.preventDefault();
        event.stopPropagation();
        console.log(event.target);
    }
});
*/

Template.floorplan.onCreated(function(){
    Meteor.subscribe('printers', function(){
        //console.log("stuff ready?");
        Tracker.autorun(function(){
            if(map_ready.get()){
                populate_map();

            }
        });

    });
});

var populate_map = function(){
    var cursor = Printers.find();
    cursor.forEach(function(printer){
        //console.log("printer", printer);
        svg.append("circle")
            .attr("cx", printer.coordinates[0])
            .attr("cy", printer.coordinates[1])
            .attr("r", 16).style("fill", "purple")
            .attr("data-mongo-id", printer._id)
            .on("click", function(d, i, nodes){
//if something was selected, restore it
                if(!!selected_circle){
                    console.log("??");
                    selected_circle.style("fill", "purple");
                }

                d3.event.stopPropagation();
                d3.event.preventDefault();
                selected_circle = d3.select(d3.event.target);
                var related_printer = selected_circle.attr("data-mongo-id");
                //console.log(d3.select(d3.event.target).attr("data-mongo-id"));
                selected_printer_id.set(related_printer);


                //color the new one
                selected_circle.style("fill", "green");
            });
    })
};

Template.form.events({
    'submit': function(event){
        event.preventDefault();
        //console.log(event);
        var target = event.target;
        var ip_address = target.ip_address.value;
        var model = target.model.value;
        var make = target.make.value;
        var network_address = target.network_address.value;
        var location = target.location.value;
        if (current_coords.get() && ip_address && model && make) {

            var printer = {
                "make": make,
                "model": model,
                "ip_address": ip_address,
                "network_address": network_address,
                "location": location,
                "coordinates": current_coords.get()
            };
            //console.log(printer);

            Printers.insert(printer);
            Materialize.toast("Printer successfully added");
            event.target.reset();
        }
        else{
            Materialize.toast("Please choose a location and fill out the required information", 4000);
        }
    }
});

Template.info.helpers({
    "current_printer": function(){
        console.log(selected_printer_id.get());
        return Printers.findOne({_id: selected_printer_id.get()});
    }
});