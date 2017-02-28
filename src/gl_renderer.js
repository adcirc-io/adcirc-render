import { gl_extensions } from './gl_extensions'
import { basic_shader } from './shaders/basic'
import { gradient_shader } from './shaders/gradient'
import { m4 } from './mat4'
import { geometry } from './geometry'
import { view } from './view'

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
        //     .set_wire_color( d3.color( 'black' ) )
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

        console.log( 'Zooming to: ' + bounds );
        console.log( dx, dy, x, y, scale, translate );

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

export { gl_renderer }