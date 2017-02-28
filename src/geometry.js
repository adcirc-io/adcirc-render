
function geometry ( gl, indexed ) {

    var _gl = gl;
    var _indexed = indexed || false;

    var _buffers = d3.map();
    var _element_buffer;

    var _bounding_box;
    var _num_elements;
    var _num_nodes;

    function _geometry ( mesh ) {

        _bounding_box = mesh.bounding_box();

        // if ( !indexed ) {
        //
        //     var _vertex_buffer = _gl.createBuffer();
        //
        // }

        _num_nodes = mesh.num_nodes();
        _num_elements = mesh.num_elements();

        var _vertex_buffer = _gl.createBuffer();
        _element_buffer = _gl.createBuffer();

        var nodes = mesh.nodes();
        var elements = mesh.elements();

        _gl.bindBuffer( _gl.ARRAY_BUFFER, _vertex_buffer );
        _gl.bufferData( _gl.ARRAY_BUFFER, nodes, _gl.STATIC_DRAW );

        _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _element_buffer );
        _gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, elements, _gl.STATIC_DRAW );

        _buffers.set( 'vertex_position', {
            buffer: _vertex_buffer,
            size: 3,
            type: _gl.FLOAT,
            normalized: false,
            stride: 0,
            offset: 0
        });

        return _geometry;

    }

    _geometry.bind_buffer = function ( attribute ) {
        var buffer = _buffers.get( attribute );
        _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.buffer );
        return buffer;
    };

    _geometry.bind_element_array = function () {

        _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _element_buffer );
        return _geometry;

    };

    _geometry.bounding_box = function () {
        return _bounding_box;
    };

    _geometry.num_elements = function () {
        return _num_elements;
    };

    _geometry.num_nodes = function () {
        return _num_nodes;
    };

    _geometry.request_vertex_attribute = function ( attribute ) {

        switch( attribute ) {

            case 'vertex_normal':
                var normals = build_vertex_normals();
                var buffer = _gl.createBuffer();
                _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
                _gl.bufferData( _gl.ARRAY_BUFFER, normals, _gl.STATIC_DRAW );
                _buffers.set( 'vertex_normal', {
                    buffer: buffer,
                    size: 3,
                    type: _gl.FLOAT,
                    normalized: false,
                    stride: 0,
                    offset: 0
                });
                break;

            case 'vertex_position':
                break;

            default:
                console.warn( attribute + ' attribute not supported' );

        }

    };


    return _geometry;


    function build_vertex_normals () {
        var _vertex_normals = new Float32Array( 9 * _num_elements );
        _vertex_normals.fill( 0 );
        for ( var i=0; i<_num_elements; ++i ) {
            _vertex_normals[ 9 * i ] = 1;
            _vertex_normals[ 9 * i + 4 ] = 1;
            _vertex_normals[ 9 * i + 8 ] = 1;
        }
        return _vertex_normals;
    }

}

export { geometry };