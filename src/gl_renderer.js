import { gl_extensions } from './gl_extensions'
import { basic_shader } from './shaders/basic'
import { mat4 } from './mat4'
import { mesh } from './mesh'

function gl_renderer () {

    var _gl,
        _extensions;

    var _canvas,
        _width = 300,
        _height = 150,
        _pixel_ratio = 1,
        _k, _tx, _ty;

    var projection_matrix = mat4();
    var transformation_matrix = mat4();

    var _clear_color = d3.color( 'black' );

    var _on_context_lost,
        _on_error;

    var _shader;

    var _items;

    function _renderer ( canvas ) {

        // Keep local reference to the canvas
        _canvas = canvas;

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
        window.addEventListener( 'resize', on_resize );
        if ( _on_context_lost ) _canvas.addEventListener( 'webglcontextlost', _on_context_lost, false );

        // Load extensions
        _extensions = gl_extensions( _gl );
        _extensions.get( 'ANGLE_instanced_arrays' );
        _extensions.get( 'OES_element_index_uint' );

        // Set up the renderer
        _renderer.clear_color( _renderer.clear_color() );
        _renderer.size( canvas.clientWidth, canvas.clientHeight );

        return _renderer;

    }

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
            _renderer.update();
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

    _renderer.test_mesh = function () {

        var vertex_buffer = _gl.createBuffer();
        var color_buffer = _gl.createBuffer();
        _shader = basic_shader( _gl );

        var vertices = [
            400,  250, 0.0, 1.0,
            500,  250, 0.0, 1.0,
            400,  350, 0.0, 1.0,
            500,  350, 0.0, 1.0
        ];

        var colors = [
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0     // blue
        ];

        _gl.bindBuffer( _gl.ARRAY_BUFFER, color_buffer );
        _gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( colors ), _gl.STATIC_DRAW );
        _gl.vertexAttribPointer( _shader.color_attrib, 4, _gl.FLOAT, false, 0, 0 );
        _gl.bindBuffer( _gl.ARRAY_BUFFER, vertex_buffer );
        _gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( vertices ), _gl.STATIC_DRAW );
        _gl.vertexAttribPointer( _shader.vertex_attrib, 4, _gl.FLOAT, false, 0, 0 );

        update_projection();
        update_transform( 1, 0, 0 );

        _renderer.render();

    };

    _renderer.render = function () {

        _renderer.update();

        if ( _shader ) {
            _gl.drawArrays( _gl.TRIANGLE_STRIP, 0, 4 );
        }

    };

    _renderer.transform = function(_) {

        if ( !arguments.length ) return { scale: _k, translate_x: _tx, translate_y: _ty };
        update_transform( arguments[0], arguments[1], arguments[2] );
        return _renderer;

    };

    _renderer.update = function () {
        if ( _gl ) {
            _gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );
        }
    };

    _renderer.size = function (_) {

        if ( !arguments.length ) return { width: _width, height: _height };
        if ( arguments.length == 1 ) {
            _width = _.width;
            _height = _.height;
        }
        if ( arguments.length == 2 ) {
            _width = arguments[ 0 ];
            _height = arguments[ 1 ];
        }
        if ( _canvas ) {
            _canvas.width = _width * _pixel_ratio;
            _canvas.height = _height * _pixel_ratio;
        }
        if ( _gl ) {
            _gl.viewport( 0, 0, _width, _height );
        }
        if ( _shader ) {
            update_projection();
        }
        _renderer.render();
        return _renderer;

    };

    return _renderer;

    function on_resize () {

        if ( _canvas.clientWidth != _width || _canvas.clientHeight != _height ) {

            _renderer.size( canvas.clientWidth, canvas.clientHeight );

        }

    }

    function update_projection () {

        projection_matrix.orthographic_projection( _width, _height );
        _gl.uniformMatrix4fv( _shader.projection_matrix, false, projection_matrix );

        update_transform( _k, _tx, _ty );

    }

    function update_transform ( k, tx, ty ) {

        transformation_matrix
            .scale( k )
            .translate( tx-_width/2, ty-_height/2 );

        _k = k;
        _tx = tx;
        _ty = ty;

        _gl.uniformMatrix4fv( _shader.transformation_matrix, false, transformation_matrix );

    }
    
}

function web_gl_available ( canvas ) {

    return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );

}

export { gl_renderer }