
var canvas = document.getElementById( 'canvas' );
var renderer = adcirc.gl_renderer()
    .on_error( on_error )
    ( canvas );

var n1 = new Float32Array([
    25, 50, 0.6,
    50, 25, 0.0,
    50, 50, 1.0,
    75, 50, 0.0,
    75, 25, 0.5
]);
var nm1 = d3.map( [0, 1, 2, 3, 4] );
var e1 = new Uint32Array([
    0, 1, 2,
    1, 2, 3,
    1, 3, 4
]);
var em1 = d3.map( [0, 1, 2] );

var n2 = new Float32Array([ 475, 325, 0, 475, 275, 0, 425, 325, 0 ]);
var elements = new Uint32Array([ 0, 1, 2 ]);

var m1 = adcirc.mesh()
    .nodes( { array: n1, map: nm1 } )
    .elements( { array: e1, map: em1 } );
    // .nodal_values( colors );

var m2 = adcirc.mesh()
    .nodes( n2 )
    .elements( elements );
    // .nodal_values( colors );

renderer
    .add_mesh( m1 );
    // .add_mesh( m2 );

renderer.zoom_to( m1, 250 );

function on_error ( error ) {
    console.log( error );
}