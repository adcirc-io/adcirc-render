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
    var _wire_alpha = 0.75;
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
        if ( !arguments.length ) return _attributes.keys();
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

function geometry ( gl, indexed ) {

    var _gl = gl;
    var _indexed = indexed || false;

    var _buffers = d3.map();

    var _bounding_box;
    var _num_elements;
    var _num_nodes;

    function _geometry ( mesh ) {

        _bounding_box = mesh.bounding_box();

        var _nodes = mesh.nodes();
        var _elements = mesh.elements();

        _num_elements = _elements.array.length;

        if ( !_indexed ) {

            _num_nodes = 3 * _num_elements;

            var _node_array = new Float32Array( _num_nodes );

            for ( var i=0; i<_num_elements; ++i ) {

                var node_number = _elements.array[ i ];
                var node_index = _nodes.map.get( node_number );

                _node_array[ 3*i ] = _nodes.array[ 3*node_index ];
                _node_array[ 3*i + 1 ] = _nodes.array[ 3*node_index + 1 ];
                _node_array[ 3*i + 2 ] = _nodes.array[ 3*node_index + 2 ];

            }

            var _vertex_buffer = _gl.createBuffer();
            _gl.bindBuffer( _gl.ARRAY_BUFFER, _vertex_buffer );
            _gl.bufferData( _gl.ARRAY_BUFFER, _node_array, _gl.STATIC_DRAW );

        } else {

            _num_nodes = _nodes.array.length;

            var _element_array = new Uint32Array( _num_elements );
            for ( var i=0; i<_num_elements; ++i ) {

                var node_number = _elements.array[ i ];
                _element_array[ i ] = _nodes.map.get( node_number );

            }

            var _vertex_buffer = _gl.createBuffer();
            _gl.bindBuffer( _gl.ARRAY_BUFFER, _vertex_buffer );
            _gl.bufferData( _gl.ARRAY_BUFFER, _nodes.array, _gl.STATIC_DRAW );

            var _element_buffer = _gl.createBuffer();
            _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _element_buffer );
            _gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, _element_array, _gl.STATIC_DRAW );

            _buffers.set( 'element_array', {
                buffer: _element_buffer
            });

        }

        _buffers.set( 'vertex_position', {
            buffer: _vertex_buffer,
            size: 3,
            type: _gl.FLOAT,
            normalized: false,
            stride: 0,
            offset: 0
        });

        return _geometry;

    }

    _geometry.bind_buffer = function ( attribute ) {
        var buffer = _buffers.get( attribute );
        _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.buffer );
        return buffer;
    };

    _geometry.bind_element_array = function () {

        var buffer = _buffers.get( 'element_array' );
        _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, buffer.buffer );
        return _geometry;

    };

    _geometry.bounding_box = function () {
        return _bounding_box;
    };

    _geometry.indexed = function () {
        return _indexed;
    };

    _geometry.num_elements = function () {
        return _num_elements;
    };

    _geometry.num_nodes = function () {
        return _num_nodes;
    };

    _geometry.request_vertex_attribute = function ( attribute ) {

        switch( attribute ) {

            case 'vertex_normal':
                var normals = build_vertex_normals();
                var buffer = _gl.createBuffer();
                _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
                _gl.bufferData( _gl.ARRAY_BUFFER, normals, _gl.STATIC_DRAW );
                _buffers.set( 'vertex_normal', {
                    buffer: buffer,
                    size: 3,
                    type: _gl.FLOAT,
                    normalized: false,
                    stride: 0,
                    offset: 0
                });
                break;

            case 'vertex_position':
                break;

            default:
                console.warn( attribute + ' attribute not supported' );

        }

    };


    return _geometry;


    function build_vertex_normals () {

        if ( !_indexed ) {

            var _vertex_normals = new Float32Array( _num_nodes );
            _vertex_normals.fill( 0 );
            for ( var i=0; i<_num_nodes/9; ++i ) {
                _vertex_normals[ 9 * i ] = 1;
                _vertex_normals[ 9 * i + 4 ] = 1;
                _vertex_normals[ 9 * i + 8 ] = 1;
            }

            return _vertex_normals;

        }

        console.error( 'You shouldn\'t be making vertex normals for indexed arrays' );

    }

}

function view ( gl ) {

    var _gl = gl;
    var _geometry;
    var _shader;

    function _view ( geometry, shader ) {

        _geometry = geometry;
        _shader = shader;

        _shader.attributes( function ( attribute, key ) {
            _geometry.request_vertex_attribute( key );
        });

        return _view;

    }

    _view.bounding_box = function () {
        if ( _geometry ) return _geometry.bounding_box();
        return [[null,null,null], [null,null,null]];
    };

    _view.render = function () {

        if ( _geometry && _shader ) {

            _shader.use();

            _shader.attributes( function ( attribute, key ) {

                var buffer = _geometry.bind_buffer( key );
                _gl.vertexAttribPointer( attribute, buffer.size, buffer.type, buffer.normalized, buffer.stride, buffer.offset );
                _gl.enableVertexAttribArray( attribute );

            });

            if ( _geometry.indexed() ) {

                _geometry.bind_element_array();
                _gl.drawElements(
                    _gl.TRIANGLES,
                    _geometry.num_elements() * 3,
                    _gl.UNSIGNED_INT,
                    0
                );

            } else {

                _gl.drawArrays( _gl.TRIANGLES, 0, _geometry.num_nodes()/3 );

            }

        }

        return _view;

    };

    _view.geometry = function () {
        return _geometry;
    };

    _view.shader = function () {
        return _shader;
    };

    return _view;

}

function gl_renderer () {

    var _gl,
        _extensions;

    var _needs_render = true;

    var _canvas,
        _width = 300,
        _height = 150,
        _pixel_ratio = 1;

    var _selection,
        _zoom = d3.zoom().on( 'zoom', zoomed );

    var _projection_matrix = m4();

    var _clear_color = d3.color( '#666666' );

    var _on_context_lost,
        _on_error;

    var _views = [];

    function _renderer ( canvas ) {

        // Keep local reference to the canvas
        _canvas = canvas;
        _selection = d3.select( _canvas );

        // Verify webgl availability
        if ( !web_gl_available( canvas ) ) {
            if ( _on_error ) _on_error ( 'WebGL not supported' );
            return;
        }

        // Acquire the webgl context
        _gl = _canvas.getContext( 'webgl' ) || _canvas.getContext( 'experimental-webgl' );

        if ( _gl === null ) {
            if ( _on_error ) _on_error ( 'Error creating WebGL context' );
            return;
        }

        // Connect any existing event listeners
        if ( _on_context_lost ) _canvas.addEventListener( 'webglcontextlost', _on_context_lost, false );

        // Load extensions
        _extensions = gl_extensions( _gl );
        _extensions.get( 'ANGLE_instanced_arrays' );
        _extensions.get( 'OES_element_index_uint' );
        _extensions.get( 'OES_standard_derivatives' );

        // Set up the renderer
        _renderer.clear_color( _renderer.clear_color() );
        check_render();

        // Set up interactivity
        _selection.call( _zoom );

        return _renderer;

    }

    _renderer.add_mesh = function ( m ) {

        var geo = geometry( _gl )( m );
        var shader = basic_shader( _gl );
        // var shader = gradient_shader( _gl, 3 );
        // var shader = gradient_shader( _gl, 3 )
        //     .set_gradient( [ 0, 0.5, 1 ], [ d3.color('steelblue'), d3.color('white'), d3.color('green') ] )
        //     .wire_color( d3.color( 'black' ) )
        //     .set_wire_alpha( 0.25 )
        //     .set_wire_width( 2.5 );
        var vew = view( _gl );

        _views.push( vew( geo, shader ) );

        update_projection();

        return _renderer.render();

    };

    _renderer.clear_color = function (_) {
        if ( !arguments.length ) return _clear_color;
        if ( arguments.length == 1 ) _clear_color = _;
        if ( arguments.length == 3 ) _clear_color = d3.rgb( arguments[0], arguments[1], arguments[2] );
        if ( arguments.length == 4 ) _clear_color = d3.rgb( arguments[0], arguments[1], arguments[2], arguments[3] );
        if ( _gl && _clear_color ) {
            _gl.clearColor(
                _clear_color.r / 255,
                _clear_color.g / 255,
                _clear_color.b / 255,
                _clear_color.opacity
            );
            _renderer.render();
        }
        return _renderer;
    };

    _renderer.context = function (_) {
        if ( !arguments.length ) return _gl;
        _gl = _;
        return _renderer;
    };

    _renderer.on_context_lost = function (_) {
        if ( !arguments.length ) return _on_context_lost;
        if ( typeof _ === 'function' ) _on_context_lost = _;
        return _renderer;
    };

    _renderer.on_error = function (_) {
        if ( !arguments.length ) return _on_error;
        if ( typeof _ === 'function' ) _on_error = _;
        return _renderer;
    };

    _renderer.render = function () {

        _needs_render = true;
        return _renderer;

    };

    _renderer.zoom_to = function (_) {

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

    };


    return _renderer;

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

        if ( _canvas.clientWidth != _width || _canvas.clientHeight != _height ) {

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
            .ortho( 0, _width,  _height, 0, -10000, 10000 )
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

function web_gl_available ( canvas ) {

    return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );

}

function mesh () {

    var _nodes = { array: [], map: d3.map() };
    var _elements = { array: [], map: d3.map() };

    var _bounding_box;

    function _mesh () {}

    _mesh.bounding_box = function () {
        return _bounding_box;
    };

    _mesh.elements = function (_) {
        if ( !arguments.length ) return _elements;
        if ( _.array && _.map ) {
            _elements = _;
            _bounding_box = calculate_bbox( _nodes.array );
        }
        return _mesh;
    };

    _mesh.element_array = function ( _ ) {
        if ( !arguments.length ) return _elements.array;
        _elements.array = _;
        return _mesh;
    };

    _mesh.element_index = function ( element_number ) {
        return _elements.map.get( element_number );
    };

    _mesh.element_map = function ( _ ) {
        if ( !arguments.length ) return _elements.map;
        _elements.map = _;
        return _mesh;
    };

    _mesh.nodes = function (_) {
        if ( !arguments.length ) return _nodes;
        if ( _.array && _.map ) {
            _nodes = _;
            _bounding_box = calculate_bbox( _nodes.array );
        }
        return _mesh;
    };

    _mesh.node_array = function ( _ ) {
        if ( !arguments.length ) return _nodes.array;
        _nodes.array = _;
        calculate_bbox( _mesh.node_array() );
        return _mesh;
    };

    _mesh.node_index = function ( node_number ) {
        return _nodes.map.get( node_number );
    };

    _mesh.node_map = function ( _ ) {
        if ( !arguments.length ) return _nodes.map;
        _nodes.map = _;
        return _mesh;
    };

    _mesh.num_elements = function () {
        return _elements ? _elements.length / 3 : 0;
    };

    _mesh.num_nodes = function () {
        return _nodes ? _nodes.array.length / 3 : 0;
    };

    return _mesh;

}

function calculate_bbox ( node_array ) {

    var numnodes = node_array.length/3;
    var minx = Infinity, maxx = -Infinity;
    var miny = Infinity, maxy = -Infinity;
    var minz = Infinity, maxz = -Infinity;
    for ( var i=0; i<numnodes; ++i ) {
        if ( node_array[3*i] < minx ) minx = node_array[3*i];
        else if ( node_array[3*i] > maxx ) maxx = node_array[3*i];
        if ( node_array[3*i+1] < miny ) miny = node_array[3*i+1];
        else if ( node_array[3*i+1] > maxy ) maxy = node_array[3*i+1];
        if ( node_array[3*i+2] < minz ) minz = node_array[3*i+2];
        else if ( node_array[3*i+2] > maxz ) maxz = node_array[3*i+2];
    }
    return [[minx, miny, minz], [maxx, maxy, maxz]];

}

exports.gl_renderer = gl_renderer;
exports.mesh = mesh;

Object.defineProperty(exports, '__esModule', { value: true });

})));
