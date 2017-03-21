// https://github.com/atdyer/adcirc-render Version 0.0.1. Copyright 2017 Tristan Dyer.
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.adcirc = global.adcirc || {})));
}(this, (function (exports) { 'use strict';

function gl_extensions ( gl ) {

    var extensions = {};

    return {

        get: function ( name ) {

            if ( extensions[ name ] !== undefined ) {

                return extensions[ name ];

            }

            var extension;

            switch ( name ) {

                case 'WEBGL_depth_texture':
                    extension = gl.getExtension( 'WEBGL_depth_texture' ) || gl.getExtension( 'MOZ_WEBGL_depth_texture' ) || gl.getExtension( 'WEBKIT_WEBGL_depth_texture' );
                    break;

                case 'EXT_texture_filter_anisotropic':
                    extension = gl.getExtension( 'EXT_texture_filter_anisotropic' ) || gl.getExtension( 'MOZ_EXT_texture_filter_anisotropic' ) || gl.getExtension( 'WEBKIT_EXT_texture_filter_anisotropic' );
                    break;

                case 'WEBGL_compressed_texture_s3tc':
                    extension = gl.getExtension( 'WEBGL_compressed_texture_s3tc' ) || gl.getExtension( 'MOZ_WEBGL_compressed_texture_s3tc' ) || gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_s3tc' );
                    break;

                case 'WEBGL_compressed_texture_pvrtc':
                    extension = gl.getExtension( 'WEBGL_compressed_texture_pvrtc' ) || gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_pvrtc' );
                    break;

                case 'WEBGL_compressed_texture_etc1':
                    extension = gl.getExtension( 'WEBGL_compressed_texture_etc1' );
                    break;

                default:
                    extension = gl.getExtension( name );

            }

            if ( extension === null ) {

                console.warn( 'WebGL: ' + name + ' extension not supported.' );

            }

            extensions[ name ] = extension;

            return extension;

        }

    };

}

function web_gl_available ( canvas ) {

    return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );

}

function m4 () {

    var mat = new Float32Array( 16 ).fill( 0 );
    var tmp = new Float32Array( 16 );
    mat[0] = mat[5] = mat[10] = mat[15] = 1;

    mat.identity = function () {

        mat.fill( 0 );
        mat[0] = mat[5] = mat[10] = mat[15] = 1;

        return mat;

    };

    mat.ortho = function ( left, right, bottom, top, near, far ) {

        mat[0]  = 2 / ( right - left );
        mat[1]  = 0;
        mat[2]  = 0;
        mat[3]  = 0;

        mat[4]  = 0;
        mat[5]  = 2 / (top - bottom);
        mat[6]  = 0;
        mat[7]  = 0;

        mat[8]  = 0;
        mat[9]  = 0;
        mat[10] = -1 / (far - near);
        mat[11] = 0;

        mat[12] = (right + left) / (left - right);
        mat[13] = (top + bottom) / (bottom - top);
        mat[14] = -near / (near - far);
        mat[15] = 1;

        return mat;

    };

    mat.scale = function ( kx, ky, kz ) {

        tmp[ 0] = kx * mat[0];
        tmp[ 1] = kx * mat[1];
        tmp[ 2] = kx * mat[2];
        tmp[ 3] = kx * mat[3];
        tmp[ 4] = ky * mat[4];
        tmp[ 5] = ky * mat[5];
        tmp[ 6] = ky * mat[6];
        tmp[ 7] = ky * mat[7];
        tmp[ 8] = kz * mat[8];
        tmp[ 9] = kz * mat[9];
        tmp[10] = kz * mat[10];
        tmp[11] = kz * mat[11];
        tmp[12] = mat[12];
        tmp[13] = mat[13];
        tmp[14] = mat[14];
        tmp[15] = mat[15];

        fill_mat();

        return mat;

    };

    mat.translate = function ( tx, ty, tz ) {

        fill_tmp();

        tmp[12] = mat[0]*tx + mat[4]*ty + mat[ 8]*tz + mat[12];
        tmp[13] = mat[1]*tx + mat[5]*ty + mat[ 9]*tz + mat[13];
        tmp[14] = mat[2]*tx + mat[6]*ty + mat[10]*tz + mat[14];
        tmp[15] = mat[3]*tx + mat[7]*ty + mat[11]*tz + mat[15];

        return fill_mat();

    };

    function fill_mat () {

        for ( var i=0; i<16; ++i ) {
            mat[i] = tmp[i];
        }

        return mat;

    }

    function fill_tmp () {

        for ( var i=0; i<16; ++i ) {
            tmp[i] = mat[i];
        }

        return tmp;

    }

    return mat;

}

function dispatcher ( object ) {

    object = object || Object.create( null );

    var _listeners = {};
    var _oneoffs = {};

    object.on = function ( type, listener ) {

        if ( !arguments.length ) return object;
        if ( arguments.length == 1 ) return _listeners[ type ];

        if ( _listeners[ type ] === undefined ) {

            _listeners[ type ] = [];

        }

        if ( _listeners[ type ].indexOf( listener ) === - 1 ) {

            _listeners[ type ].push( listener );

        }

        return object;

    };

    object.once = function ( type, listener ) {

        if ( !arguments.length ) return object;
        if ( arguments.length == 1 ) return _oneoffs[ type ];

        if ( _oneoffs[ type ] === undefined ) {

            _oneoffs[ type ] = [];

        }

        if ( _oneoffs[ type ].indexOf( listener ) === - 1 ) {

            _oneoffs[ type ].push( listener );

        }

        return object;

    };

    object.off = function ( type, listener ) {

        var listenerArray = _listeners[ type ];
        var oneoffArray = _oneoffs[ type ];
        var index;

        if ( listenerArray !== undefined ) {

            index = listenerArray.indexOf( listener );

            if ( index !== - 1 ) {

                listenerArray.splice( index, 1 );

            }

        }

        if ( oneoffArray !== undefined ) {

            index = oneoffArray.indexOf( listener );

            if ( index !== -1 ) {

                oneoffArray.splice( index, 1 );

            }

        }

        return object;

    };

    object.dispatch = function ( event ) {

        var listenerArray = _listeners[ event.type ];
        var oneoffArray = _oneoffs[ event.type ];

        var array = [], i, length;

        if ( listenerArray !== undefined ) {

            event.target = object;

            length = listenerArray.length;

            for ( i = 0; i < length; i ++ ) {

                array[ i ] = listenerArray[ i ];

            }

            for ( i = 0; i < length; i ++ ) {

                array[ i ].call( object, event );

            }

        }

        if ( oneoffArray !== undefined ) {

            event.target = object;

            length = oneoffArray.length;

            for ( i = 0; i < length; i ++ ) {

                array[ i ] = oneoffArray[ i ];

            }

            for ( i = 0; i < length; i ++ ) {

                array[ i ].call( object, event );

            }

            _oneoffs[ event.type ] = [];

        }

        return object;

    };

    return object;

}

function gl_renderer ( selection ) {

    var _renderer = dispatcher();
    var _selection = selection;
    var _canvas = selection.node();

    if ( !web_gl_available( _canvas ) ) return;

    var _gl_attributes = { alpha: false, antialias: false, premultiplieAlpha: false, stencil: true };
    var _gl = _canvas.getContext( 'webgl', _gl_attributes ) || _canvas.getContext( 'experimental-webgl', _gl_attributes);

    if ( _gl === null ) return;

    var _extensions = gl_extensions( _gl );
    _extensions.get( 'ANGLE_instanced_arrays' );
    _extensions.get( 'OES_element_index_uint' );
    _extensions.get( 'OES_standard_derivatives' );

    var _width = 0;
    var _height = 0;
    var _pixel_ratio = 1;
    var _clear_color = d3.color( 'white' );

    var _projection_matrix = m4();
    var _zoom = d3.zoom().on( 'zoom', zoomed );
    _selection.call( _zoom );

    var _needs_render = true;
    var _views = [];

    _renderer.add_view = function ( view ) {

        view.on( 'update', _renderer.render );
        _views.push( view );
        update_projection();
        return _renderer;

    };

    _renderer.clear_color = function ( _ ) {

        if ( !arguments.length ) return _clear_color;
        _clear_color = d3.rgb.apply( _clear_color, arguments );

        _gl.clearColor(
            _clear_color.r / 255,
            _clear_color.g / 255,
            _clear_color.b / 255,
            _clear_color.opacity
        );

        return _renderer.render();

    };

    _renderer.gl_context = function () {

        return _gl;

    };

    _renderer.remove_view = function ( view ) {

        view.off( 'update', _renderer.render );
        return _renderer;

    };

    _renderer.render = function () {

        _needs_render = true;
        return _renderer;

    };

    _renderer.zoom_to = function ( _ ) {

        if ( !arguments.length ) return _renderer;

        var bounds = _.bounding_box();
        var duration = 0;
        var dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = _height - (bounds[0][1] + bounds[1][1]) / 2,
            scale = 0.9 / Math.max( dx / _width, dy / _height ),
            translate = [ _width / 2 - scale * x, _height / 2 - scale * y];

        if ( arguments.length == 2 )
            duration = arguments[1];

        _selection
            .transition()
            .duration( duration )
            .call(
                _zoom.transform,
                d3.zoomIdentity
                    .translate( translate[0], translate[1] )
                    .scale( scale )
            );

        return _renderer;

    };

    _canvas.addEventListener( 'webglcontextlost', bubble_event );
    _canvas.addEventListener( 'webglcontextrestored', bubble_event );
    _canvas.addEventListener( 'webglcontextcreationerror', bubble_event );

    check_render();

    return _renderer;


    function bubble_event ( event ) {

        _renderer.dispatch( event );

    }

    function check_render () {

        if ( resize() || _needs_render ) {

            _needs_render = false;
            render();

        }

        requestAnimationFrame( check_render );

    }

    function render () {

        _gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );

        for ( var i=0; i<_views.length; ++i ) {
            _views[i].render();
        }

    }

    function resize () {

        if ( _canvas.clientWidth !== _width || _canvas.clientHeight !== _height ) {

            _width = _canvas.clientWidth;
            _height = _canvas.clientHeight;
            _canvas.width = _width * _pixel_ratio;
            _canvas.height = _height * _pixel_ratio;
            _gl.viewport( 0, 0, _width, _height );
            update_projection();
            return true;

        }

        return false;

    }

    function update_projection ( k, tx, ty ) {

        if ( !arguments.length ) {
            var t = d3.zoomTransform( _canvas );
            return update_projection( t.k, t.x, t.y );
        }

        _projection_matrix
            .ortho( 0, _width, _height, 0, -10000, 10000 )
            .translate( tx, ty, 0 )
            .scale( k, -k, 1 )
            .translate( 0, -_height, 0 );

        for ( var i=0; i<_views.length; ++i ) {
            _views[i].shader().set_projection( _projection_matrix );
        }

    }

    function zoomed () {

        var t = d3.event.transform;
        update_projection( t.k, t.x, t.y );
        _renderer.render();

    }

}

function geometry ( gl, mesh ) {

    var _gl = gl;
    var _mesh = mesh;

    var _num_triangles = 0;
    var _num_vertices = 0;

    var _buffers = d3.map();
    var _geometry = dispatcher();

    _geometry.bind_buffer = function ( attribute ) {

        var buffer = _buffers.get( attribute );

        if ( buffer ) {

            _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.buffer );
            return buffer;

        }

    };

    _geometry.bounding_box = function () {

        return _mesh.bounding_box();

    };

    _geometry.drawArrays = function () {

        _gl.drawArrays( _gl.TRIANGLES, 0, _num_triangles * 3 );

    };


    initialize( _mesh.nodes(), _mesh.elements() );

    _mesh.on( 'elemental_value', on_elemental_value );
    _mesh.on( 'nodal_value', on_nodal_value );


    return _geometry;


    function initialize ( nodes, elements ) {

        _num_vertices = elements.array.length;
        _num_triangles = elements.array.length / 3;

        var vertex_position = new Float32Array( 2 * _num_vertices );
        var vertex_value = new Float32Array( _num_vertices );
        var vertex_normals = new Float32Array( 3 * _num_vertices );

        var dimensions = nodes.dimensions;
        for ( var i=0; i<_num_vertices; ++i ) {

            var node_number = elements.array[ i ];
            var node_index = nodes.map.get( node_number );

            vertex_position[ 2 * i ] = nodes.array[ dimensions * node_index ];
            vertex_position[ 2 * i + 1 ] = nodes.array[ dimensions * node_index + 1 ];

        }

        for ( var i=0; i<_num_triangles; ++i ) {
            vertex_normals[ 9 * i ] = 1;
            vertex_normals[ 9 * i + 4 ] = 1;
            vertex_normals[ 9 * i + 8 ] = 1;
        }

        var position_buffer = _gl.createBuffer();
        _gl.bindBuffer( _gl.ARRAY_BUFFER, position_buffer );
        _gl.bufferData( _gl.ARRAY_BUFFER, vertex_position, _gl.STATIC_DRAW );

        var value_buffer = _gl.createBuffer();
        _gl.bindBuffer( _gl.ARRAY_BUFFER, value_buffer );
        _gl.bufferData( _gl.ARRAY_BUFFER, vertex_value, _gl.DYNAMIC_DRAW );

        var normal_buffer = _gl.createBuffer();
        _gl.bindBuffer( _gl.ARRAY_BUFFER, normal_buffer );
        _gl.bufferData( _gl.ARRAY_BUFFER, vertex_normals, _gl.STATIC_DRAW );

        _buffers.set( 'vertex_position', {
            buffer: position_buffer,
            size: 2,
            type: _gl.FLOAT,
            normalized: false,
            stride: 0,
            offset: 0
        });

        _buffers.set( 'vertex_value', {
            buffer: value_buffer,
            size: 1,
            type: _gl.FLOAT,
            normalized: false,
            stride: 0,
            offset: 0
        });

        _buffers.set( 'vertex_normal', {
            buffer: normal_buffer,
            size: 3,
            type: _gl.FLOAT,
            normalized: false,
            stride: 0,
            offset: 0
        });


    }

    function on_elemental_value ( event ) {

        var data = new Float32Array( 3 * _num_triangles );

        for ( var i=0; i<_num_triangles; ++i ) {

            var value = event.array[i];

            data[ 3 * i ] = value;
            data[ 3 * i + 1 ] = value;
            data[ 3 * i + 2 ] = value;

        }

        var buffer = _buffers.get( 'vertex_value' );
        _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.buffer );
        _gl.bufferSubData( _gl.ARRAY_BUFFER, 0, data );

        _geometry.dispatch({
            type: 'update',
            value: event.value
        });

    }

    function on_nodal_value ( event ) {

        var data = new Float32Array( 3 * _num_triangles );
        var nodes = _mesh.nodes();
        var elements = _mesh.elements();

        for ( var i=0; i<3*_num_triangles; ++i ) {

            var node_number = elements.array[ i ];
            var node_index = nodes.map.get( node_number );

            data[ i ] = values[ node_index ];

        }

        var buffer = _buffers.get( 'vertex_value' );
        _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.buffer );
        _gl.bufferSubData( _gl.ARRAY_BUFFER, 0, data );

        _geometry.dispatch({
            type: 'update',
            value: event.value
        });

    }

}

function view ( gl, geometry, shader ) {

    var _gl = gl;
    var _geometry = geometry;
    var _shader = shader;

    var _view = dispatcher();

    _view.render = function () {

        _shader.use();

        _shader.attributes().each( function ( attribute, key ) {

            var buffer = _geometry.bind_buffer( key );

            if ( buffer !== 'undefined' ) {

                _gl.vertexAttribPointer(
                    attribute,
                    buffer.size,
                    buffer.type,
                    buffer.normalize,
                    buffer.stride,
                    buffer.offset
                );

                _gl.enableVertexAttribArray( attribute );

            }

        } );

        _geometry.drawArrays();

    };

    _view.shader = function () {

        return _shader;

    };

    _geometry.on( 'update', _view.dispatch );

    return _view;

}

function gl_shader ( gl, type, code, warn_cb, error_cb ) {

    var shader = gl.createShader( type );

    gl.shaderSource( shader, code );
    gl.compileShader( shader );

    if ( gl.getShaderParameter( shader, gl.COMPILE_STATUS ) === false ) {

        var info = gl.getShaderInfoLog( shader );
        if ( !error_cb ) error_cb = console.error;
        error_cb( 'Unable to compile shader' );
        error_cb( info );
        gl.deleteShader( shader );
        return;

    }

    if ( gl.getShaderParameter( shader, gl.COMPILE_STATUS ) === false ) {

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

function gl_program ( gl, vertex_source, fragment_source, warn_cb, error_cb ) {

    var shader_program = gl.createProgram();
    var vertex_shader = gl_shader( gl, gl.VERTEX_SHADER, vertex_source, warn_cb, error_cb );
    var fragment_shader = gl_shader( gl, gl.FRAGMENT_SHADER, fragment_source, warn_cb, error_cb );

    if ( shader_program && vertex_shader && fragment_shader ) {

        gl.attachShader( shader_program, vertex_shader );
        gl.attachShader( shader_program, fragment_shader );
        gl.linkProgram( shader_program );

        if ( gl.getProgramParameter( shader_program, gl.LINK_STATUS ) === false ) {

            if ( !error_cb ) error_cb = console.error;
            error_cb( gl.getProgramInfoLog( shader_program ) );

        }

        gl.deleteShader( vertex_shader );
        gl.deleteShader( fragment_shader );

        return shader_program;

    }

}

function basic_shader ( gl ) {

    var _gl = gl;
    var _program = gl_program( _gl, basic_vertex(), basic_fragment() );
    var _face_color = d3.color( 'white' );
    var _wire_color = d3.color( 'black' );
    var _wire_alpha = 0.3;
    var _wire_width = 1.0;

    _gl.useProgram( _program );

    var _attributes = d3.map({
        'vertex_normal': _gl.getAttribLocation( _program, 'vertex_normal' ),
        'vertex_position': _gl.getAttribLocation( _program, 'vertex_position' )
    });

    var _uniforms = d3.map({
        'face_color': _gl.getUniformLocation( _program, 'face_color' ),
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

    _program.face_color = function ( _ ) {
        if ( !arguments.length ) return _face_color;
        _face_color = _;
        _gl.useProgram( _program );
        _gl.uniform3fv( _program.uniform( 'face_color' ), [ _.r/255, _.g/255, _.b/255 ] );
        return _program;
    };

    _program.set_projection = function ( matrix ) {

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
        .face_color( _program.face_color() )
        .wire_alpha( _program.wire_alpha() )
        .wire_color( _program.wire_color() )
        .wire_width( _program.wire_width() );

}

function basic_vertex () {

    return [
        'attribute vec3 vertex_position;',
        'attribute vec3 vertex_normal;',
        'uniform mat4 projection_matrix;',
        'varying vec3 _vertex_normal;',
        'void main( void ) {',
        '   gl_Position = projection_matrix * vec4( vertex_position, 1.0 );',
        '   _vertex_normal = vertex_normal;',
        '}'
    ].join('\n');

}

function basic_fragment () {

    return [
        '#extension GL_OES_standard_derivatives : enable',
        'precision highp float;',
        'varying vec3 _vertex_normal;',
        'uniform vec3 face_color;',
        'uniform vec3 wire_color;',
        'uniform float wire_alpha;',
        'uniform float wire_width;',
        'float edgeFactorTri() {',
        '   vec3 d = fwidth( _vertex_normal.xyz );',
        '   vec3 a3 = smoothstep( vec3( 0.0 ), d * wire_width, _vertex_normal.xyz );',
        '   return min( min( a3.x, a3.y ), a3.z );',
        '}',
        'void main() {',
        '   vec4 wire = mix( vec4(face_color, 1.0), vec4(wire_color, 1.0), wire_alpha);',
        '   gl_FragColor = mix( wire, vec4(face_color, 1.0), edgeFactorTri() );',
        '}'
    ].join('\n');

}

function gradient_shader ( gl, num_colors, min, max ) {

    var _gl = gl;
    var _program = gl_program( _gl, gradient_vertex( num_colors ), gradient_fragment() );
    var _gradient_colors = [];
    var _gradient_stops = [];
    var _wire_color = d3.color( 'black' );
    var _wire_alpha = 0.3;
    var _wire_width = 1.0;

    var min = min || 0;
    var max = max || 1;
    for ( var i=0; i<num_colors; ++i ) {
        _gradient_stops.push( min + ( max-min ) * i/(num_colors-1) );
        _gradient_colors.push( d3.color( d3.schemeCategory20c[i%num_colors] ) );
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
        _gradient_stops = _;
        _gl.useProgram( _program );
        _gl.uniform1fv( _program.uniform( 'gradient_stops' ), _gradient_stops );
        return _program;
    };

    _program.set_projection = function ( matrix ) {
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
        code.push( '  _vertex_color = mix( _vertex_color, gradient_colors['+i+'], t*t*(3.0-2.0*t));');
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
        '   gl_FragColor = mix( wire, vec4(_vertex_color, 1.0), edgeFactorTri() );',
        '}'
    ].join('\n');

}

exports.gl_renderer = gl_renderer;
exports.geometry = geometry;
exports.view = view;
exports.basic_shader = basic_shader;
exports.gradient_shader = gradient_shader;

Object.defineProperty(exports, '__esModule', { value: true });

})));
