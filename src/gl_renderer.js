import { gl_extensions } from './gl_extensions'
import { basic_shader } from './shaders/basic'
import { mat4, m4 } from './mat4'
import { mesh } from './mesh'
import { geometry } from './geometry'
import { view } from './view'

function gl_renderer () {

    var _gl,
        _extensions;

    var _needs_render = true;

    var _canvas,
        _width = 300,
        _height = 150,
        _pixel_ratio = 1,
        _k = 1,
        _tx = 0,
        _ty = 0;

    var projection_matrix = m4();
    var transformation_matrix = m4();

    var _clear_color = d3.color( 'black' );

    var _on_context_lost,
        _on_error;

    var _views = [];

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
        if ( _on_context_lost ) _canvas.addEventListener( 'webglcontextlost', _on_context_lost, false );

        // Load extensions
        _extensions = gl_extensions( _gl );
        _extensions.get( 'ANGLE_instanced_arrays' );
        _extensions.get( 'OES_element_index_uint' );

        // Set up the renderer
        _renderer.clear_color( _renderer.clear_color() );
        check_render();

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

    _renderer.add_mesh = function ( m ) {

        var geo = geometry( _gl )( m );
        var shader = basic_shader( _gl );
        var vew = view( _gl );

        // Bind the shader to the geometry using the view
        _views.push( vew( geo, shader ) );

        // Update matrices
        update_projection();

        // Render
        return _renderer.render();

    };

    _renderer.render = function () {

        _needs_render = true;
        return _renderer;

    };

    _renderer.transform = function(_) {

        if ( !arguments.length ) return { scale: _k, translate_x: _tx, translate_y: _ty };
        update_transform( arguments[0], arguments[1], arguments[2] );
        return _renderer;

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
            update_transform( _k, _tx, _ty );
            return true;

        }

        return false;

    }

    function update_projection () {

        projection_matrix.ortho( 0, _width, _height, 0, -1, 1 );

        for ( var i=0; i<_views.length; ++i ) {
            _views[i].shader().set_projection( projection_matrix );
        }

        update_transform( _k, _tx, _ty );

    }

    function update_transform ( k, tx, ty ) {

        transformation_matrix.identity()
            .translate( tx, ty, 0 )
            .scale( k, -k, 1 )
            .translate( 0, -_height, 0);

        _k = k;
        _tx = tx;
        _ty = ty;

        for ( var i=0; i<_views.length; ++i ) {
            _views[i].shader().set_transformation( transformation_matrix );
        }

    }
    
}

function web_gl_available ( canvas ) {

    return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );

}

export { gl_renderer }