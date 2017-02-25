
function view ( gl ) {

    var _gl = gl;
    var _geometry;
    var _shader;

    function _view ( geometry, shader ) {

        _geometry = geometry;
        _shader = shader;

        return _view;

    }

    _view.bounding_box = function () {
        if ( _geometry ) return _geometry.bounding_box();
        return [[null,null], [null,null], [null,null]];
    };

    _view.render = function () {

        if ( _geometry && _shader ) {

            _shader.use();

            _geometry.bind_locations();
            _gl.vertexAttribPointer( _shader.attrib_position(), 3, _gl.FLOAT, false, 0, 0 );
            _gl.enableVertexAttribArray( _shader.attrib_position() );

            _geometry.bind_nodal_values();
            _gl.vertexAttribPointer( _shader.attrib_color(), 4, _gl.FLOAT, false, 0, 0 );
            _gl.enableVertexAttribArray( _shader.attrib_color() );

            _geometry.bind_element_array();
            _gl.drawElements(
                _gl.TRIANGLES,
                _geometry.num_elements(),
                _gl.UNSIGNED_INT,
                0
            );

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