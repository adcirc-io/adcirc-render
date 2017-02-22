import { gl_extensions } from './gl_extensions'
import { basic_shader } from './shaders/basic'

function gl_renderer () {

    var _gl,
        _extensions;

    var _canvas,
        _width = 300,
        _height = 150,
        _pixel_ratio = 1;

    var _clear_color;

    var _on_context_lost,
        _on_error;

    var _shader;

    function _renderer ( canvas ) {

        _canvas = canvas;

        if ( !web_gl_available( canvas ) ) {
            if ( _on_error ) _on_error ( 'WebGL not supported' );
            return;
        }

        _gl = _canvas.getContext( 'webgl' ) || _canvas.getContext( 'experimental-webgl' );

        if ( _gl === null ) {
            if ( _on_error ) _on_error ( 'Error creating WebGL context' );
            return;
        }

        if ( _on_context_lost ) {
            _canvas.addEventListener( 'webglcontextlost', _on_context_lost, false );
        }

        _extensions = gl_extensions( _gl );
        _extensions.get( 'ANGLE_instanced_arrays' );
        _extensions.get( 'OES_element_index_uint' );

        _renderer.clear_color( _renderer.clear_color() );
        _renderer.size( _renderer.size() );

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
             0.5,  0.5, 0.0, 1.0,
            -0.5,  0.5, 0.0, 1.0,
             0.5, -0.5, 0.0, 1.0,
            -0.5, -0.5, 0.0, 1.0
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

        _renderer.matrix( 1, 0, 0 );
        _renderer.render();

    };

    _renderer.matrix = function ( k, tx, ty ) {

        var scale_matrix = new Float32Array([
            k, 0, 0, 0,
            0, k, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);

        var translate_matrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx/(100*k), -ty/(100*k), 0, 1
        ]);

        _gl.uniformMatrix4fv( _shader.scale_uniform, false, scale_matrix );
        _gl.uniformMatrix4fv( _shader.translate_uniform, false, translate_matrix );

    };

    _renderer.render = function () {

        _renderer.update();
        _gl.drawArrays( _gl.TRIANGLE_STRIP, 0, 4 );

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
            _canvas.style.width = _width + 'px';
            _canvas.style.height = _height + 'px';
        }
        if ( _gl ) {
            _gl.viewport( 0, 0, _width, _height );
        }
        _renderer.update();
        return _renderer;
    };

    // _renderer.viewport = function (_) {
    //     if ( !arguments.length ) return _viewport;
    //     _viewport = _;
    //     if ( _gl ) {
    //         _gl.viewport( _viewport.x, _viewport.y, _viewport.width, _viewport.height );
    //         _renderer.update();
    //     }
    //     return _renderer;
    // };

    return _renderer;
    
}

function web_gl_available ( canvas ) {

    return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );

}

export { gl_renderer }