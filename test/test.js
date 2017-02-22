
var canvas = document.getElementById( 'canvas' );
var renderer = adcirc.gl_renderer()
    .clear_color( d3.color( 'steelblue' ) )
    .size( 900, 600 )
    .on_error( on_error )
    ( canvas );

var zoom = d3.zoom()
    // .extent([[0,0],[canvas.width,canvas.height]])
    .on( 'zoom', zoomed );

d3.select( canvas).call( zoom );

renderer.test_mesh();

function on_error ( error ) {
    console.log( error );
}

function zoomed () {
    console.log( d3.event.transform );
    var t = d3.event.transform;
    renderer.matrix( t.k, t.x, t.y );
    renderer.render();
}