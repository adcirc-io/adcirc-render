
var canvas = document.getElementById( 'canvas' );
var renderer = adcirc.gl_renderer()
    .clear_color( d3.color( 'steelblue' ) )
    .on_error( on_error )
    ( canvas );

var zoom = d3.zoom()
    .on( 'zoom', zoomed );

d3.select( '#canvas' ).call( zoom );



// var n1 = new Float32Array([
//     400, 250, 0,
//     500, 250, 0,
//     400, 350, 0
// ]);
var n1 = new Float32Array([
    25, 50, 0,
    50, 25, 0,
    50, 50, 0
]);

var e1 = new Uint32Array([
    0, 1, 2
]);

var colors = new Float32Array([
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    1.0, 1.0, 0.0, 1.0
]);

var m1 = adcirc.mesh()
    .nodes( n1 )
    .elements( e1 )
    .nodal_values( colors );

var n2 = new Float32Array([
    475, 325, 0,
    475, 275, 0,
    425, 325, 0
]);

var e2 = new Uint32Array([
    0, 1, 2
]);

var m2 = adcirc.mesh()
    .nodes( n2 )
    .elements( e2 )
    .nodal_values( colors );

renderer
    .add_mesh( m1 )
    .add_mesh( m2 );


function on_error ( error ) {
    console.log( error );
}

function zoomed () {
    var t = d3.event.transform;
    renderer.transform( t.k, t.x, t.y );
    renderer.render();
}