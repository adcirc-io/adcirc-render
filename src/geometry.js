
// A geometry object that can be built manually or from an adcirc mesh
function geometry ( gl ) {

    var _gl = gl;

    var _element_buffer;
    var _vertex_buffer;
    var _nodal_values_buffer;

    var _bounding_box;
    var _num_elements;
    var _num_nodes;

    // Allows you to build a geometry from an adcirc mesh
    function _geometry ( mesh ) {

        _bounding_box = mesh.bounding_box();
        _num_nodes = mesh.num_nodes();
        _num_elements = mesh.num_elements();

        if ( !_vertex_buffer ) _vertex_buffer = _gl.createBuffer();
        if ( !_element_buffer ) _element_buffer = _gl.createBuffer();

        _gl.bindBuffer( _gl.ARRAY_BUFFER, _vertex_buffer );
        _gl.bufferData( _gl.ARRAY_BUFFER, mesh.nodes(), _gl.STATIC_DRAW );

        _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _element_buffer );
        _gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, mesh.elements(), _gl.STATIC_DRAW );

        if ( mesh.nodal_values() ) {
            _nodal_values_buffer = _gl.createBuffer();
            _gl.bindBuffer( _gl.ARRAY_BUFFER, _nodal_values_buffer );
            _gl.bufferData( _gl.ARRAY_BUFFER, mesh.nodal_values(), _gl.STATIC_DRAW );
        }

        return _geometry;

    }

    _geometry.bind_element_array = function () {

        _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _element_buffer );
        return _geometry;

    };

    _geometry.bounding_box = function () {
        return _bounding_box;
    };

    _geometry.bind_locations = function () {
        _gl.bindBuffer( _gl.ARRAY_BUFFER, _vertex_buffer );
        return _geometry;
    };

    _geometry.bind_nodal_values = function () {
        _gl.bindBuffer( _gl.ARRAY_BUFFER, _nodal_values_buffer );
        return _geometry;
    };

    _geometry.num_elements = function () {
        return _num_elements;
    };

    _geometry.num_nodes = function () {
        return _num_nodes;
    };


    return _geometry;

}

export { geometry };