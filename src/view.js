import { dispatcher } from '../../adcirc-events/index'

function view ( gl, geometry, shader ) {

    var _gl = gl;
    var _geometry = geometry;
    var _shader = shader;

    var _view = dispatcher();

    _view.elemental_value = function ( value ) {

        _geometry.elemental_value( value );

    };

    _view.nodal_value = function ( value ) {

        _geometry.nodal_value( value );

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

        _geometry.drawArrays();

    };

    _view.shader = function () {

        return _shader;

    };

    _geometry.on( 'update', _view.dispatch );

    return _view;

}

export { view }