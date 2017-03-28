import { dispatcher } from '../../adcirc-events/index'

function geometry ( gl, mesh ) {

    var _gl = gl;
    var _mesh = mesh;

    var _num_triangles = 0;
    var _num_vertices = 0;

    var _buffers = d3.map();
    var _geometry = dispatcher();

    _geometry.bind_buffer = function ( attribute ) {

        var buffer = _buffers.get( attribute );

        if ( buffer ) {

            _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.buffer );
            return buffer;

        }

    };

    _geometry.bounding_box = function () {

        return _mesh.bounding_box();

    };

    _geometry.draw_arrays = function () {

        _gl.drawArrays( _gl.TRIANGLES, 0, _num_triangles * 3 );

    };

    _geometry.elemental_value = function ( value ) {

        var data = _mesh.elemental_value( value );

        if ( data ) {

            set_elemental_value( data );

            _geometry.dispatch({
                type: 'update',
                value: value
            });

        }

    };

    _geometry.nodal_value = function ( value ) {

        var data = _mesh.nodal_value( value );

        if ( data ) {

            set_nodal_value( data );

            _geometry.dispatch({
                type: 'update',
                value: value
            });

        }

    };


    initialize( _mesh.nodes(), _mesh.elements() );

    return _geometry;


    function initialize ( nodes, elements ) {

        _num_vertices = elements.array.length;
        _num_triangles = elements.array.length / 3;

        var vertex_position = new Float32Array( 2 * _num_vertices );
        var vertex_value = new Float32Array( _num_vertices );
        var vertex_normals = new Float32Array( 3 * _num_vertices );

        var dimensions = nodes.dimensions;
        for ( var i=0; i<_num_vertices; ++i ) {

            var node_number = elements.array[ i ];
            var node_index = nodes.map.get( node_number );

            vertex_position[ 2 * i ] = nodes.array[ dimensions * node_index ];
            vertex_position[ 2 * i + 1 ] = nodes.array[ dimensions * node_index + 1 ];

        }

        for ( var i=0; i<_num_triangles; ++i ) {
            vertex_normals[ 9 * i ] = 1;
            vertex_normals[ 9 * i + 4 ] = 1;
            vertex_normals[ 9 * i + 8 ] = 1;
        }

        var position_buffer = _gl.createBuffer();
        _gl.bindBuffer( _gl.ARRAY_BUFFER, position_buffer );
        _gl.bufferData( _gl.ARRAY_BUFFER, vertex_position, _gl.STATIC_DRAW );

        var value_buffer = _gl.createBuffer();
        _gl.bindBuffer( _gl.ARRAY_BUFFER, value_buffer );
        _gl.bufferData( _gl.ARRAY_BUFFER, vertex_value, _gl.DYNAMIC_DRAW );

        var normal_buffer = _gl.createBuffer();
        _gl.bindBuffer( _gl.ARRAY_BUFFER, normal_buffer );
        _gl.bufferData( _gl.ARRAY_BUFFER, vertex_normals, _gl.STATIC_DRAW );

        _buffers.set( 'vertex_position', {
            buffer: position_buffer,
            size: 2,
            type: _gl.FLOAT,
            normalized: false,
            stride: 0,
            offset: 0
        });

        _buffers.set( 'vertex_value', {
            buffer: value_buffer,
            size: 1,
            type: _gl.FLOAT,
            normalized: false,
            stride: 0,
            offset: 0
        });

        _buffers.set( 'vertex_normal', {
            buffer: normal_buffer,
            size: 3,
            type: _gl.FLOAT,
            normalized: false,
            stride: 0,
            offset: 0
        });


    }

    function set_elemental_value ( data ) {

        var array = new Float32Array( 3 * _num_triangles );

        for ( var i=0; i<_num_triangles; ++i ) {

            var value = data[i];

            array[ 3 * i ] = value;
            array[ 3 * i + 1 ] = value;
            array[ 3 * i + 2 ] = value;

        }

        var buffer = _buffers.get( 'vertex_value' );
        _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.buffer );
        _gl.bufferSubData( _gl.ARRAY_BUFFER, 0, array );

    }

    function set_nodal_value ( data ) {

        var array = new Float32Array( 3 * _num_triangles );
        var node_map = _mesh.nodes().map;
        var elements = _mesh.elements().array;

        for ( var i=0; i<3*_num_triangles; ++i ) {

            var node_number = elements[ i ];
            var node_index = node_map.get( node_number );

            array[ i ] = data[ node_index ];

        }

        var buffer = _buffers.get( 'vertex_value' );
        _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.buffer );
        _gl.bufferSubData( _gl.ARRAY_BUFFER, 0, array );

    }

}

export { geometry }