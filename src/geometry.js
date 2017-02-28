
function geometry ( gl, indexed ) {

    var _gl = gl;
    var _indexed = indexed || false;

    var _buffers = d3.map();

    var _bounding_box;
    var _num_elements;
    var _num_nodes;

    function _geometry ( mesh ) {

        _bounding_box = mesh.bounding_box();

        var _nodes = mesh.nodes();
        var _elements = mesh.elements();

        _num_elements = _elements.array.length;

        if ( !_indexed ) {

            _num_nodes = 3 * _num_elements;

            var _node_array = new Float32Array( _num_nodes );

            for ( var i=0; i<_num_elements; ++i ) {

                var node_number = _elements.array[ i ];
                var node_index = _nodes.map.get( node_number );

                _node_array[ 3*i ] = _nodes.array[ 3*node_index ];
                _node_array[ 3*i + 1 ] = _nodes.array[ 3*node_index + 1 ];
                _node_array[ 3*i + 2 ] = _nodes.array[ 3*node_index + 2 ];

            }

            var _vertex_buffer = _gl.createBuffer();
            _gl.bindBuffer( _gl.ARRAY_BUFFER, _vertex_buffer );
            _gl.bufferData( _gl.ARRAY_BUFFER, _node_array, _gl.STATIC_DRAW );

        } else {

            _num_nodes = _nodes.array.length;

            var _element_array = new Uint32Array( _num_elements );
            for ( var i=0; i<_num_elements; ++i ) {

                var node_number = _elements.array[ i ];
                _element_array[ i ] = _nodes.map.get( node_number );

            }

            var _vertex_buffer = _gl.createBuffer();
            _gl.bindBuffer( _gl.ARRAY_BUFFER, _vertex_buffer );
            _gl.bufferData( _gl.ARRAY_BUFFER, _nodes.array, _gl.STATIC_DRAW );

            var _element_buffer = _gl.createBuffer();
            _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _element_buffer );
            _gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, _element_array, _gl.STATIC_DRAW );

            _buffers.set( 'element_array', {
                buffer: _element_buffer
            });

        }

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

        var buffer = _buffers.get( 'element_array' );
        _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, buffer.buffer );
        return _geometry;

    };

    _geometry.bounding_box = function () {
        return _bounding_box;
    };

    _geometry.indexed = function () {
        return _indexed;
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

        if ( !_indexed ) {

            var _vertex_normals = new Float32Array( _num_nodes );
            _vertex_normals.fill( 0 );
            for ( var i=0; i<_num_nodes/9; ++i ) {
                _vertex_normals[ 9 * i ] = 1;
                _vertex_normals[ 9 * i + 4 ] = 1;
                _vertex_normals[ 9 * i + 8 ] = 1;
            }

            return _vertex_normals;

        }

        console.error( 'You shouldn\'t be making vertex normals for indexed arrays' );

    }

}

export { geometry };