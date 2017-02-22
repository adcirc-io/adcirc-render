
var canvas = document.getElementById( 'canvas' );
var renderer = adcirc.gl_renderer()
    .clear_color( d3.color( 'steelblue' ) )
    .on_error( on_error );

renderer( canvas );

function on_error ( error ) {
    console.log( error );
}