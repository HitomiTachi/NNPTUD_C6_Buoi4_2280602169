var express = require('express');
var router = express.Router();
let { categoriesData } = require('../utils/categoriesData');
let { data } = require('../utils/data');
let slugify = require('slugify');
let { IncrementalId } = require('../utils/IncrementalIdHandler');

// GET /api/v1/categories - Lấy tất cả categories, có thể truy vấn theo name
router.get('/', function (req, res, next) {
    let nameQ = req.query.name ? req.query.name : '';
    let result = categoriesData.filter(function (e) {
        return (!e.isDeleted) && 
               e.name.toLowerCase().includes(nameQ.toLowerCase());
    });
    res.send(result);
});

// GET /api/v1/categories/slug/:slug - Lấy category theo slug
router.get('/slug/:slug', function (req, res, next) {
    let slug = req.params.slug;
    let result = categoriesData.find(
        function (e) {
            return (!e.isDeleted) && e.slug == slug;
        }
    );
    if (result) {
        res.status(200).send(result);
    } else {
        res.status(404).send({
            message: "SLUG NOT FOUND"
        });
    }
});

// GET /api/v1/categories/:id/products - Lấy tất cả products có category id tương ứng
// Phải đặt trước route /:id để Express không nhầm "products" là id
router.get('/:id/products', function (req, res, next) {
    let categoryId = parseInt(req.params.id);
    let result = data.filter(function (e) {
        return (!e.isDeleted) && 
               e.category && 
               e.category.id == categoryId;
    });
    res.status(200).send(result);
});

// GET /api/v1/categories/:id - Lấy category theo id
router.get('/:id', function (req, res, next) {
    let result = categoriesData.find(
        function (e) {
            return (!e.isDeleted) && e.id == parseInt(req.params.id);
        }
    );
    if (result) {
        res.status(200).send(result);
    } else {
        res.status(404).send({
            message: "ID NOT FOUND"
        });
    }
});

// POST /api/v1/categories - Tạo category mới
router.post('/', function (req, res, next) {
    let newObj = {
        id: IncrementalId(categoriesData),
        name: req.body.name,
        slug: slugify(req.body.name, {
            replacement: '-', 
            lower: true, 
            locale: 'vi',
        }),
        image: req.body.image || '',
        creationAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    categoriesData.push(newObj);
    res.status(201).send(newObj);
});

// PUT /api/v1/categories/:id - Cập nhật category
router.put('/:id', function (req, res, next) {
    let result = categoriesData.find(
        function (e) {
            return e.id == parseInt(req.params.id);
        }
    );
    if (result) {
        let body = req.body;
        let keys = Object.keys(body);
        for (const key of keys) {
            if (key === 'name' && body[key]) {
                result[key] = body[key];
                // Tự động cập nhật slug khi name thay đổi
                result.slug = slugify(body[key], {
                    replacement: '-', 
                    lower: true, 
                    locale: 'vi',
                });
            } else if (key !== 'id' && key !== 'creationAt' && result.hasOwnProperty(key)) {
                result[key] = body[key];
            }
        }
        result.updatedAt = new Date().toISOString();
        res.status(200).send(result);
    } else {
        res.status(404).send({
            message: "ID NOT FOUND"
        });
    }
});

// DELETE /api/v1/categories/:id - Xóa category (soft delete)
router.delete('/:id', function (req, res, next) {
    let result = categoriesData.find(
        function (e) {
            return e.id == parseInt(req.params.id);
        }
    );
    if (result) {
        result.isDeleted = true;
        res.status(200).send(result);
    } else {
        res.status(404).send({
            message: "ID NOT FOUND"
        });
    }
});

module.exports = router;

