
var canvas = document.getElementById( 'canvas' );
var renderer = adcirc.gl_renderer()
    .clear_color( d3.color( 'steelblue' ) )
    .on_error( on_error )
    ( canvas );

var n1 = new Float32Array([ 25, 50, 0, 50, 25, 0, 50, 50, 0 ]);
var n2 = new Float32Array([ 475, 325, 0, 475, 275, 0, 425, 325, 0 ]);
var elements = new Uint32Array([ 0, 1, 2 ]);
var colors = new Float32Array([ 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1 ]);

var m1 = adcirc.mesh()
    .nodes( n1 )
    .elements( elements )
    .nodal_values( colors );

var m2 = adcirc.mesh()
    .nodes( n2 )
    .elements( elements )
    .nodal_values( colors );

renderer
    .add_mesh( m1 )
    .add_mesh( m2 );

renderer.zoom_to( m1, 1000 );

function on_error ( error ) {
    console.log( error );
}