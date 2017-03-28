import { dispatcher } from '../../adcirc-events/index'

function view ( gl, geometry, shader ) {

    var _gl = gl;
    var _geometry = geometry;
    var _shader = shader;

    var _view = dispatcher();

    _view.elemental_value = function ( value ) {

        _geometry.elemental_value( value );
        return _view;

    };

    _view.nodal_value = function ( value ) {

        _geometry.nodal_value( value );
        return _view;

    };

    _view.render = function () {

        _shader.use();

        _shader.attributes().each( function ( attribute, key ) {

            var buffer = _geometry.bind_buffer( key );

            if ( buffer !== 'undefined' ) {

                _gl.vertexAttribPointer(
                    attribute,
                    buffer.size,
                    buffer.type,
                    buffer.normalized,
                    buffer.stride,
                    buffer.offset
                );

                _gl.enableVertexAttribArray( attribute );

            }

        } );

        _geometry.draw_arrays();
        return _view;

    };

    _view.shader = function ( _ ) {

        if ( !arguments.length ) return _shader;
        _.projection( _shader.projection() );
        _shader = _;
        _view.dispatch( { type: 'update' } );
        return _view;

    };

    _geometry.on( 'update', _view.dispatch );

    return _view;

}

export { view }