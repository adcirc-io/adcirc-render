import { gl_extensions } from './gl_extensions'
import { gl_shader } from './gl_shader'

function gl_renderer () {

    var _gl,
        _extensions;

    var _canvas,
        _width,
        _height;

    var _clear_color;

    var _on_context_lost,
        _on_error;

    function _renderer ( canvas ) {

        _canvas = canvas;
        _width = canvas.width;
        _height = canvas.height;

        if ( !web_gl_available( canvas ) ) {
            if ( _on_error ) _on_error ( 'WebGL not supported' );
            return;
        }

        _gl = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );

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

        if ( _clear_color ) _renderer.clear_color( _renderer.clear_color() );

    }

    _renderer.clear_color = function (_) {
        if ( !arguments.length ) return _clear_color;
        if ( arguments.length == 1 ) _clear_color = _;
        if ( arguments.length == 3 ) _clear_color = d3.rgb( arguments[0], arguments[1], arguments[2] );
        if ( arguments.length == 4 ) _clear_color = d3.rgb( arguments[0], arguments[1], arguments[2], arguments[3] );
        if ( _gl ) {
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

    _renderer.update = function () {
        _gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );
    };

    return _renderer;
    
}

function web_gl_available ( canvas ) {

    return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );

}

export { gl_renderer }