
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

export { view }