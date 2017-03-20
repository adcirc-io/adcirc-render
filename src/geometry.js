import { dispatcher } from '../../adcirc-events/index'

function geometry_new ( gl, mesh, indexed ) {

    var _gl = gl;
    var _mesh = mesh;
    var _indexed = indexed;

    var _buffers = d3.map();
    var _geometry = dispatcher();

    _geometry.bind_buffer = function ( attribute ) {

        var buffer = _buffers.get( attribute );

        if ( buffer ) {

            _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.buffer );
            return buffer;

        }

    };


    return _geometry;

}

function geometry ( gl, indexed ) {

    var _gl = gl;
    var _indexed = indexed || false;

    var _mesh;
    var _buffers = d3.map();

    var _elemental_value;
    var _nodal_value;

    var _bounding_box;
    var _num_triangles;
    var _num_vertices;

    var _subscribers = [];

    function _geometry () {}

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

    _geometry.elemental_value = function ( _ ) {
        _elemental_value = _;
        return _geometry;
    };

    _geometry.indexed = function () {
        return _indexed;
    };

    _geometry.mesh = function ( _ ) {

        if ( !arguments.length ) return _mesh;

        _mesh = _;
        _bounding_box = _mesh.bounding_box();

        var _nodes = _mesh.nodes();
        var _elements = _mesh.elements();

        _num_triangles = _elements.array.length / 3;

        if ( !_indexed ) {

            _num_vertices = 3 * _num_triangles;

            var _coord_array = new Float32Array( 2 * 3 * _num_triangles );      // x, y for all 3 corners
            var _coord_value_array = new Float32Array( 3 * _num_triangles );    // z for all 3 corners

            for ( var i=0; i<3*_num_triangles; ++i ) {      // Loop through element array

                var node_number = _elements.array[ i ];
                var node_index = _nodes.map.get( node_number );

                _coord_array[ 2*i ] = _nodes.array[ 3*node_index ];
                _coord_array[ 2*i + 1 ] = _nodes.array[ 3*node_index + 1 ];
                _coord_value_array[ i ] = _nodes.array[ 3*node_index + 2 ];

            }

        } else {

            _num_vertices = _nodes.array.length / 3;

            var _coord_array = new Float32Array( 2 * _num_vertices / 3 );
            var _coord_value_array = new Float32Array( _num_vertices / 3 );
            var _element_array = new Uint32Array( _num_triangles );
            for ( var i=0; i<_num_triangles; ++i ) {

                var node_number = _elements.array[ i ];
                var node_index = _nodes.map.get( node_number );
                _coord_array[ node_index ] = _nodes.array[ node_index ];
                _coord_array[ node_index + 1 ] = _nodes.array[ node_index + 1 ];
                _coord_value_array[ node_index ] = _nodes.array[ node_index + 2 ];
                _element_array[ i ] = node_index;

            }

            var _element_buffer = _gl.createBuffer();
            _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _element_buffer );
            _gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, _element_array, _gl.STATIC_DRAW );

            _buffers.set( 'element_array', {
                buffer: _element_buffer
            });

        }

        var _vertex_buffer = _gl.createBuffer();
        _gl.bindBuffer( _gl.ARRAY_BUFFER, _vertex_buffer );
        _gl.bufferData( _gl.ARRAY_BUFFER, _coord_array, _gl.STATIC_DRAW );

        var _vertex_value_buffer = _gl.createBuffer();
        _gl.bindBuffer( _gl.ARRAY_BUFFER, _vertex_value_buffer );
        _gl.bufferData( _gl.ARRAY_BUFFER, _coord_value_array, _gl.DYNAMIC_DRAW );

        _buffers.set( 'vertex_position', {
            buffer: _vertex_buffer,
            size: 2,
            type: _gl.FLOAT,
            normalized: false,
            stride: 0,
            offset: 0
        });

        _buffers.set( 'vertex_value', {
            buffer: _vertex_value_buffer,
            size: 1,
            type: _gl.FLOAT,
            normalize: false,
            stride: 0,
            offset: 0
        });

        _mesh.subscribe( on_mesh_update );

        return _geometry;
    };

    _geometry.nodal_value = function ( _ ) {
        _nodal_value = _;
        return _geometry;
    };

    _geometry.num_triangles = function () {
        return _num_triangles;
    };

    _geometry.num_vertices = function () {
        return _num_vertices;
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
            case 'vertex_value':
                break;

            default:
                console.warn( attribute + ' attribute not supported' );

        }

    };

    _geometry.subscribe = function ( _ ) {
        if ( !arguments.length ) {
            _subscribers = [];
            return _geometry;
        }
        _subscribers.push( _ );
        return _geometry;
    };

    return _geometry;

    function on_mesh_update ( value ) {

        if ( value == _nodal_value ) {

            // There will be num_nodes values that need to be applied to 3*num_triangles values
            var data = new Float32Array( 3*_num_triangles );
            var values = _mesh.nodal_value( value );
            var _elements = _mesh.elements();
            var _nodes = _mesh.nodes();

            for ( var i=0; i<3*_num_triangles; ++i ) {

                var node_number = _elements.array[ i ];
                var node_index = _nodes.map.get( node_number );

                data[ i ] = values[ node_index ];

            }

            var buffer = _buffers.get( 'vertex_value' );
            _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.buffer );
            _gl.bufferSubData( _gl.ARRAY_BUFFER, 0, data );

            _subscribers.forEach( function ( cb ) { cb( value ); } );

        }

        if ( value == _elemental_value ) {

            // There will be num_triangles values that need to be applied to 3*num_triangles values
            var data = new Float32Array( 3*_num_triangles );
            var values = _mesh.elemental_value( value );

            for ( var i=0; i<_num_triangles; ++i ) {

                var value = values[i];

                data[ 3*i ] = value;
                data[ 3*i + 1 ] = value;
                data[ 3*i + 2 ] = value;

            }

            var buffer = _buffers.get( 'vertex_value' );
            _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.buffer );
            _gl.bufferSubData( _gl.ARRAY_BUFFER, 0, data );

            _subscribers.forEach( function ( cb ) { cb( value ); } );

        }

    }

    function build_vertex_normals () {

        if ( !_indexed ) {

            var _vertex_normals = new Float32Array( 9 * _num_triangles );
            _vertex_normals.fill( 0 );
            for ( var i=0; i<_num_triangles; ++i ) {
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