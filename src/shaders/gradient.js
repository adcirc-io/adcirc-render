import { gl_program } from '../gl_program'

function gradient_shader ( gl, num_colors, min, max ) {

    num_colors = num_colors > 1 ? num_colors : 2;

    var _gl = gl;
    var _program = gl_program( _gl, gradient_vertex( num_colors ), gradient_fragment() );
    var _gradient_colors = [];
    var _gradient_stops = [];
    var _projection;
    var _wire_color = d3.color( 'black' );
    var _wire_alpha = 0.3;
    var _wire_width = 1.0;

    var min = min || 0;
    var max = max || 1;
    for ( var i=0; i<num_colors; ++i ) {
        _gradient_stops.push( min + ( max-min ) * i/(num_colors-1) );
        _gradient_colors.push( d3.color( d3.schemeCategory20[i%num_colors] ) );
    }

    _gl.useProgram( _program );

    var _attributes = d3.map({
        'vertex_normal': _gl.getAttribLocation( _program, 'vertex_normal' ),
        'vertex_position': _gl.getAttribLocation( _program, 'vertex_position' ),
        'vertex_value': _gl.getAttribLocation( _program, 'vertex_value' )
    });

    var _uniforms = d3.map({
        'gradient_colors': _gl.getUniformLocation( _program, 'gradient_colors' ),
        'gradient_stops': _gl.getUniformLocation( _program, 'gradient_stops' ),
        'projection_matrix': _gl.getUniformLocation( _program, 'projection_matrix' ),
        'wire_alpha': _gl.getUniformLocation( _program, 'wire_alpha' ),
        'wire_color': _gl.getUniformLocation( _program, 'wire_color' ),
        'wire_width': _gl.getUniformLocation( _program, 'wire_width' )
    });

    _program.attribute = function ( attribute ) {
        return _attributes.get( attribute );
    };

    _program.attributes = function ( _ ) {
        if ( !arguments.length ) return _attributes;
        _attributes.each( _ );
        return _program;
    };

    _program.gradient_colors = function ( _ ) {
        if ( !arguments.length ) return _gradient_colors;
        _gradient_colors = _;
        var flattened = _gradient_colors
            .map( function ( color ) { return [ color.r/255, color.g/255, color.b/255 ] } )
            .reduce( function ( a, b ) { return a.concat( b ); }, [] );
        _gl.useProgram( _program );
        _gl.uniform3fv( _program.uniform( 'gradient_colors' ), flattened );
        return _program;
    };

    _program.gradient_stops = function ( _ ) {
        if ( !arguments.length ) return _gradient_stops;
        if ( _.length == 2 && num_colors !== 2 ) _ = interpolate_stops( _[0], _[1], num_colors );
        _gradient_stops = _;
        _gl.useProgram( _program );
        _gl.uniform1fv( _program.uniform( 'gradient_stops' ), _gradient_stops );
        return _program;
    };

    _program.projection = function ( matrix ) {
        if ( !arguments.length ) return _projection;
        _projection = matrix;
        _gl.useProgram( _program );
        _gl.uniformMatrix4fv( _program.uniform( 'projection_matrix' ), false, matrix );
        return _program;
    };

    _program.wire_alpha = function ( _ ) {
        if ( !arguments.length ) return _wire_alpha;
        _wire_alpha = _;
        _gl.useProgram( _program );
        _gl.uniform1f( _program.uniform( 'wire_alpha' ), _ );
        return _program;
    };

    _program.wire_color = function ( _ ) {
        if ( !arguments.length ) return _wire_color;
        _wire_color = _;
        _gl.useProgram( _program );
        _gl.uniform3fv( _program.uniform( 'wire_color' ), [_.r/255, _.g/255, _.b/255] );
        return _program;
    };

    _program.wire_width = function ( _ ) {
        if ( !arguments.length ) return _wire_width;
        _wire_width = _;
        _gl.useProgram( _program );
        _gl.uniform1f( _program.uniform( 'wire_width' ), _ );
        return _program;
    };

    _program.uniform = function ( uniform ) {
        return _uniforms.get( uniform );
    };

    _program.uniforms = function () {
        return _uniforms.keys();
    };

    _program.use = function () {
        _gl.useProgram( _program );
        return _program;
    };

    return _program
        .gradient_colors( _program.gradient_colors() )
        .gradient_stops( _program.gradient_stops() )
        .wire_alpha( _program.wire_alpha() )
        .wire_color( _program.wire_color() )
        .wire_width( _program.wire_width() );

    function interpolate_stops ( min, max, num_stops ) {

        var stops = [];

        for ( var i=0; i<num_stops; ++i ) {
            stops.push( min + ( max-min ) * i/(num_stops-1) );
        }

        return stops;

    }

}

function gradient_vertex ( num_colors ) {

    var code = [
        'attribute vec2 vertex_position;',
        'attribute vec3 vertex_normal;',
        'attribute float vertex_value;',
        'uniform mat4 projection_matrix;',
        'uniform float gradient_stops[' + num_colors + '];',
        'uniform vec3 gradient_colors[' + num_colors + '];',
        'varying vec3 _vertex_normal;',
        'varying vec3 _vertex_color;',
        'void main() {',
        '  gl_Position = projection_matrix * vec4( vertex_position, vertex_value, 1.0 );',
        '  _vertex_normal = vertex_normal;',
        '  _vertex_color = gradient_colors[0];',
        '  float t;'
    ];

    for ( var i=1; i<num_colors; ++i ) {
        code.push( '  t = clamp((vertex_value - gradient_stops['+(i-1)+']) / (gradient_stops['+i+']-gradient_stops['+(i-1)+']), 0.0, 1.0);' );
        code.push( '  _vertex_color = mix( _vertex_color, gradient_colors['+i+'], t*t*(3.0-2.0*t));')
    }

    code.push('}');

    return code.join( '\n' );

}

function gradient_fragment () {

    return [
        '#extension GL_OES_standard_derivatives : enable',
        'precision mediump float;',
        'varying vec3 _vertex_normal;',
        'varying vec3 _vertex_color;',
        'uniform vec3 wire_color;',
        'uniform float wire_alpha;',
        'uniform float wire_width;',
        'float edgeFactorTri() {',
        '   vec3 d = fwidth( _vertex_normal.xyz );',
        '   vec3 a3 = smoothstep( vec3( 0.0 ), d * wire_width, _vertex_normal.xyz );',
        '   return min( min( a3.x, a3.y ), a3.z );',
        '}',
        'void main() {',
        '   vec4 wire = mix( vec4(_vertex_color, 1.0), vec4(wire_color, 1.0), wire_alpha);',
        '   if ( wire_width == 0.0 ) {',
        '       gl_FragColor = vec4(_vertex_color, 1.0);',
        '   } else {',
        '       gl_FragColor = mix( wire, vec4(_vertex_color, 1.0), edgeFactorTri() );',
        '   }',
        '}'
    ].join('\n');

}

export { gradient_shader }