import { gl_shader } from './gl_shader'

function gl_program ( gl, vertex_source, fragment_source, warn_cb, error_cb ) {

    var shader_program = gl.createProgram();
    var vertex_shader = gl_shader( gl, gl.VERTEX_SHADER, vertex_source, warn_cb, error_cb );
    var fragment_shader = gl_shader( gl, gl.FRAGMENT_SHADER, fragment_source, warn_cb, error_cb );

    if ( shader_program && vertex_shader && fragment_shader ) {

        gl.attachShader( shader_program, vertex_shader );
        gl.attachShader( shader_program, fragment_shader );
        gl.linkProgram( shader_program );

        gl.deleteShader( vertex_shader );
        gl.deleteShader( fragment_shader );

        return shader_program;

    }

}

export { gl_program }