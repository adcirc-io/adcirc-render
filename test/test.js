// Setup

var nodes = [];
var node_map = [];
var elements = [];
var element_map = [];

var num_rows = 2;
var num_cols = 10;

var node_count = 0;
var element_count = 0;
var mul = 1;

for ( var row=0; row<num_rows; ++row ) {
    for ( var col=0; col<num_cols; ++col ) {
        nodes.push( mul*col, mul*row, 0 );
        node_map.push( node_count++ );
        if ( col < num_cols-1 && row < num_rows-1 ) {
            elements.push( col, col+1, col+num_cols );
            elements.push( col+1, col+num_cols, col+num_cols+1 );
            element_map.push( element_count++, element_count++ );
        }
    }
}

node_map = d3.map( node_map );
element_map = d3.map( element_map );


// Actual library testing

var canvas = d3.select( '#canvas' );
var renderer = adcirc
    .gl_renderer( canvas )
    .clear_color( 'lightgray' );

var mesh = adcirc
    .mesh()
    .nodes( { array: nodes, map: node_map, dimensions: 3 } )
    .elements( { array: elements, map: element_map } );

var geometry = adcirc
    .geometry( renderer.gl_context(), mesh );

var shader = adcirc
    .gradient_shader(
        renderer.gl_context(),
        4,
        geometry.bounding_box()[0][2],
        geometry.bounding_box()[0][2]
    );

var view = adcirc
    .view( renderer.gl_context(), geometry, shader );

renderer.add_view( view )
    .zoom_to( geometry, 200 );

d3.interval( random_heights, 250 );

function random_heights () {

    var num_vals = num_rows * ( num_cols - 1 );
    var heights = [];
    for ( var i=0; i<num_vals; ++i ) {
        heights.push( Math.random() );
    }

    mesh.elemental_value( 'height', heights );
    geometry.elemental_value( 'height' );

}
