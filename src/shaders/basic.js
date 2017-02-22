import { gl_program } from '../gl_program'

function basic_vertex () {

    return [
        'attribute vec4 vertex_position;',
        'attribute vec4 vertex_color;',
        'varying lowp vec4 vert_color;',
        'uniform mat4 matrix;',
        // 'uniform mat4 translate_matrix;',
        // 'uniform mat4 scale_matrix;',
        'void main( void ) {',
        // '   gl_Position = translate_matrix * scale_matrix * vertex_position;',
        '   gl_Position = matrix * vertex_position;',
        '   vert_color = vertex_color;',
        '}'
    ].join('\n');

}

function basic_fragment () {

    return [
        'varying lowp vec4 vert_color;',
        'void main( void ) {',
        '   gl_FragColor = vert_color;',
        '}'
    ].join('\n');

}

function basic_shader ( gl ) {

    var program = gl_program( gl, basic_vertex(), basic_fragment() );

    gl.useProgram( program );
    program.vertex_attrib = gl.getAttribLocation( program, 'vertex_position' );
    program.color_attrib = gl.getAttribLocation( program, 'vertex_color' );
    program.matrix_uniform = gl.getUniformLocation( program, 'matrix' );
    program.translate_uniform = gl.getUniformLocation( program, 'translate_matrix' );
    program.scale_uniform = gl.getUniformLocation( program, 'scale_matrix' );
    gl.enableVertexAttribArray( program.vertex_attrib );
    gl.enableVertexAttribArray( program.color_attrib );

    console.log( program );

    return program;

}

export { basic_shader }