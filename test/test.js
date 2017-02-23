
var canvas = document.getElementById( 'canvas' );
var renderer = adcirc.gl_renderer()
    .clear_color( d3.color( 'steelblue' ) )
    .on_error( on_error )
    ( canvas );

var zoom = d3.zoom()
    .on( 'zoom', zoomed );

d3.select( '#canvas' ).call( zoom );

renderer.test_mesh();

function on_error ( error ) {
    console.log( error );
}

function zoomed () {
    var t = d3.event.transform;
    renderer.transform( t.k, t.x, t.y );
    renderer.render();
}