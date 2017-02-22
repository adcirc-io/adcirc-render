function gl_shader ( gl, type, code, warn_cb, error_cb ) {

    var shader = gl.createShader( type );

    gl.shaderSource( shader, code );
    gl.compileShader( shader );

    if ( gl.getShaderParameter( shader, gl.COMPILE_STATUS ) === false ) {

        gl.deleteShader( shader );
        if ( !error_cb ) error_cb = console.error;
        error_cb( 'Unable to compile shader' );
        return;

    }

    if ( gl.getShaderInfoLog( shader ) !== '' ) {

        if ( !warn_cb ) warn_cb = console.warn;
        warn_cb( gl.getShaderInfoLog( shader ), add_line_numbers( code ) );

    }

    return shader;

}

function add_line_numbers ( code ) {

    var lines = code.split( '\n' );

    for ( var i = 0; i < lines.length; i ++ ) {

        lines[ i ] = ( i + 1 ) + ': ' + lines[ i ];

    }

    return lines.join( '\n' );

}

export { gl_shader }