const express = require('express');

const response = require('../network/response');
const Store = require('../store/mysql');
const error = require('../utils/error');

const router = express.Router();
router.use( express.json() );

const list = async ( req, res, next ) => {
    try {
        const data = await Store.list( req.params.table );
        response.success( req, res, data, 200 );
    } catch (error) {
        next(error);
    }
};

const get = async ( req, res, next ) => {

    try {
        let data;
        if( !!req.params.id ) {
            switch( req.params.table ) {
                case 'auth':
                    data = await Store.get( req.params.table, req.params.id, 'username' );
                    break;
                default:
                    data = await Store.get( req.params.table, req.params.id, 'id' );
                    break;
            }
        } else if( !!req.params.username ) {
            data = await Store.get( req.params.table, req.params.username, 'username' );
        } else if( !!req.params.title ) {
            data = await Store.get( req.params.table, req.params.title, 'title' );
        } else if ( !!req.params.user_to ) {
            data = await Store.get( req.params.table, req.params.user_to, 'user_to' );
        } else {
            throw error( 'Endpoint not allowed', 500 );
        }

        response.success( req, res, data, 200 );
    } catch (error) {
        next(error);
    }
};

const upsert = async ( req, res, next ) => {
    try {
        let data;
        switch( req.params.table ) {
            case 'auth':
            case 'user':
                data = await Store.upsertUser( req.params.table, req.body );
                break;
            case 'post':
                data = await Store.upsertPost( req.params.table, req.body );
                break;
            case 'user_follow':
                data = await Store.upsertFollower( req.params.table, req.body, req.params.id );
                break;
            default:
                throw error( 'Endpoint not allowed', 500 );
        }

        response.success( req, res, data, 200 );
    } catch (error) {
        next(error);
    }
};

const query = async ( req, res, next ) => {
    try {
        const { query, join } = req.body;
        const data = await Store.query( req.params.table, query, join );
        response.success( req, res, data, 200 );
    } catch (error) {
        next(error);
    }
};

const update = async ( req, res, next ) => {
    try {
        const data = await Store.update( req.params.table, req.params.id, req.body );
        response.success( req, res, data, 200 );
    } catch (error) {
        next(error);
    }
};

const remove = async ( req, res, next ) => {
    try {
        const data = await Store.remove( req.params.table, req.params.id );
        response.success( req, res, data, 200 );
    } catch (error) {
        next(error);
    }
};

/**
 * Routes
 */
router.post('/:table/follow/:id', upsert );
router.get('/:table/:user_to/followers', query );

router.get('/:table/:id/:criteria', get );

router.get('/:table', list );
router.post('/:table', upsert );
router.put('/:table/:id', update );
router.delete('/:table/:id', remove );

module.exports = router;