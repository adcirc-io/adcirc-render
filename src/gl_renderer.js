import { gl_extensions, web_gl_available } from './gl_extensions'
import { m4 } from './mat4'
import { dispatcher } from 'adcirc-events'

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
    var _offset_y;
    var _pixel_ratio = 1;
    var _clear_color = d3.color( 'white' );

    var _projection_matrix = m4();
    var _zoom = d3.zoom()
        .on( 'zoom', zoomed );
    _selection
        .call( _zoom )
        .on( 'mousemove', on_hover )
        .on( 'click', on_click );

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

    _renderer.set_view = function ( view ) {

        view.on( 'update', _renderer.render );
        _views = [ view ];
        update_projection();
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

    _canvas.addEventListener( 'webglcontextlost', _renderer.dispatch );
    _canvas.addEventListener( 'webglcontextrestored', _renderer.dispatch );
    _canvas.addEventListener( 'webglcontextcreationerror', _renderer.dispatch );

    check_render();

    return _renderer;

    function check_render () {

        if ( resize() || _needs_render ) {

            _needs_render = false;
            render();

        }

        requestAnimationFrame( check_render );

    }

    function on_click () {

        var mouse = d3.mouse( this );
        var transform = d3.zoomTransform( _canvas );
        var pos = transform.invert( mouse );
        pos[1] = _offset_y - pos[1];

        _renderer.dispatch({
            type: 'click',
            coordinates: pos,
            mouse: mouse,
            transform: transform,
            offset_y: _offset_y
        });

    }

    function on_hover () {

        var mouse = d3.mouse( this );
        var pos = d3.zoomTransform( _canvas ).invert( [mouse[0], mouse[1] ] );
        pos[1] = _offset_y - pos[1];

        _renderer.dispatch({
            type: 'hover',
            coordinates: pos
        });

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

            if ( !_offset_y || _offset_y < 0 ) _offset_y = _height;

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
            .translate( 0, -_offset_y, 0 );

        for ( var i=0; i<_views.length; ++i ) {
            _views[i].shader().projection( _projection_matrix );
        }

        _renderer.dispatch({
            type: 'projection',
            transform: d3.zoomTransform( _canvas )
        });

    }

    function zoomed () {

        var t = d3.event.transform;
        update_projection( t.k, t.x, t.y );
        _renderer.render();

    }

}

export { gl_renderer };