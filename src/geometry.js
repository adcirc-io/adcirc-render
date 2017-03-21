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

    _geometry.drawArrays = function () {

        _gl.drawArrays( _gl.TRIANGLES, 0, _num_triangles * 3 );

    };


    initialize( _mesh.nodes(), _mesh.elements() );

    _mesh.on( 'elemental_value', on_elemental_value );
    _mesh.on( 'nodal_value', on_nodal_value );


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

    function on_elemental_value ( event ) {

        var data = new Float32Array( 3 * _num_triangles );

        for ( var i=0; i<_num_triangles; ++i ) {

            var value = event.array[i];

            data[ 3 * i ] = value;
            data[ 3 * i + 1 ] = value;
            data[ 3 * i + 2 ] = value;

        }

        var buffer = _buffers.get( 'vertex_value' );
        _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.buffer );
        _gl.bufferSubData( _gl.ARRAY_BUFFER, 0, data );

        _geometry.dispatch({
            type: 'update',
            value: event.value
        });

    }

    function on_nodal_value ( event ) {

        var data = new Float32Array( 3 * _num_triangles );
        var nodes = _mesh.nodes();
        var elements = _mesh.elements();

        for ( var i=0; i<3*_num_triangles; ++i ) {

            var node_number = elements.array[ i ];
            var node_index = nodes.map.get( node_number );

            data[ i ] = values[ node_index ];

        }

        var buffer = _buffers.get( 'vertex_value' );
        _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.buffer );
        _gl.bufferSubData( _gl.ARRAY_BUFFER, 0, data );

        _geometry.dispatch({
            type: 'update',
            value: event.value
        });

    }

}

export { geometry }