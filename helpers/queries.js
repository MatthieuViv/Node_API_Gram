const headerUserToken = 'usertoken';
const RECIPE_TABLE = "recipe";
const ID = "id";
const RECIPE_TABLE_CATEGORY_ID = "category_id";
const USER_LIKE_TABLE = "user_like";
const USER_LIKE_TABLE_USER_ID = "user_id";
const USER_LIKE_TABLE_RECIPE_ID = "recipe_id";
const USER_DISLIKE_TABLE = "user_dislike";
const USER_DISLIKE_TABLE_USER_ID = "user_id";
const USER_DISLIKE_TABLE_RECIPE_ID = "recipe_id";
const CATEGORY_TABLE = "category";
const ORDERS_TABLE = "orders";
const ORDERS_RECIPE_TABLE = "orders_recipe";


export const USER_QUERIES = {
    insert: 'INSERT INTO user (email_address, name, first_name, password, phone_number, postal_address, register_datetime, salt, last_connection_datetime, connection_token) VALUES (?,?,?,?,?,?, NOW(), ?, NOW(), ?)',
    update: 'UPDATE user SET email_address = ? , name = ? , first_name = ?, password = ?, phone_number = ?, postal_address = ?, salt = ? WHERE id = ?',
    selectAllUser: 'SELECT * FROM user',
    selectUserSafely: 'SELECT id, email_address, name, first_name, phone_number, postal_address, connection_token FROM user where email_address=?',
    selectWithEmail: 'SELECT id, email_address, name, first_name, phone_number, postal_address, salt, password FROM user where email_address=?',
    selectWithId: 'SELECT id, email_address, name, first_name, phone_number, postal_address, connection_token FROM user where id=?',
    checkIfTokenExists: 'SELECT connection_token from user where connection_token = ?',
    checkIfTokenExistsAndCorrespondsToUser: 'SELECT id, connection_token from user where connection_token = ? AND id=?',
    updateUserToken: 'UPDATE user SET last_connection_datetime = NOW(), connection_token = ? WHERE email_address =?',
    checkConnexion: "SELECT email_address FROM user WHERE connection_token = ?",
    selectWithToken: 'SELECT id, email_address, name, first_name, phone_number, postal_address FROM user where connection_token=?',
};

export const UTENSIL_QUERIES = {
    selectUtensilsFromRecipe: "SELECT id, name from utensil INNER JOIN recipe_utensil ON utensil.id = recipe_utensil.utensil_id where recipe_utensil.recipe_id = ? ",
    selectRecipe: "SELECT * from recipe where id = ? ",
    querySelectAllUtensil: "SELECT * from utensil",
};

export const CATEGORY_QUERIES = {
    selectAll: 'SELECT * FROM ' + CATEGORY_TABLE,
    select: "SELECT * FROM " + CATEGORY_TABLE + " WHERE " + CATEGORY_TABLE + ".id = ?",
    insert: "INSERT INTO " + CATEGORY_TABLE + " (name, image_id) VALUES(?, ?)",
    delete: "DELETE FROM " + CATEGORY_TABLE + " WHERE " + CATEGORY_TABLE + ".id = ?",
};

export const INSTRUCTION_QUERIES = {
    selectRecipe: "SELECT * from recipe where id = ? ",
    selectInstructionsFromRecipe: "SELECT * from instruction where instruction.recipe_id = ? ",
};

export const ORDER_QUERIES = {
    selectAllOrdersFromUser: "SELECT * FROM " + ORDERS_TABLE + " WHERE " + ORDERS_TABLE + ".user_id = ?",
    select: "SELECT * FROM " + ORDERS_TABLE + " WHERE " + ORDERS_TABLE + ".id = ? AND " + ORDERS_TABLE + ".user_id = ?",
    insert: "INSERT INTO " + ORDERS_TABLE + "(order_datetime, delivery_datetime, user_id, price, status_id) VALUES (NOW(), NOW(), ?, ?, '1')",
    selectRecipesOfOrder: "Select id, category_id, name, description, price, picture_id, video_id , number_of_portion FROM recipe INNER JOIN orders_recipe ON recipe.id = orders_recipe.recipe_id WHERE orders_recipe.order_id = ?",
    insertInOrderRecipeTable: "INSERT INTO orders_recipe (orders_recipe.order_id, orders_recipe.recipe_id, orders_recipe.number_of_portion) VALUES (?, ?, ?)"
};

export const PROMOTIONS_QUERIES = {
    select: "SELECT * from recipe where id = ? ",
    selectAll: "SELECT * from promotion",
    selectAllAdmin: "SELECT promotion.*, recipe.name as recipe_name , category.name as category_name FROM gram_dev.promotion left join recipe on recipe.id = promotion.recipe_id left join category on category.id = promotion.category_id",
    insertPercentageCategoryPromotion: "INSERT INTO promotion (name,description,offer_type,category_id,percentage_value) VALUES(?, ?, ?, ?, ?)",
    insertPercentageRecipePromotion: "INSERT INTO promotion (name,description,offer_type,recipe_id,percentage_value) VALUES(?, ?, ?, ?, ?)",
    insertValueCategoryPromotion: "INSERT INTO promotion (name,description,offer_type,category_id,price_value) VALUES(?, ?, ?, ?, ?)",
    insertValueRecipePromotion: "INSERT INTO promotion (name,description,offer_type,recipe_id,price_value) VALUES(?, ?, ?, ?, ?)",
    delete: "DELETE FROM promotion WHERE id = ?",
    PromotionType: Object.freeze({ "CATEGORY": "CATEGORY", "RECIPE": "RECIPE" }),
    
};

export const RECIPE_QUERIES = {
    //SELECT
    select: "SELECT * FROM " + RECIPE_TABLE + " WHERE " + ID + " = ?",
    selectUserLikedRecipes: "SELECT id, category_id, name, description, price, picture_id, video_id FROM " + RECIPE_TABLE + " INNER JOIN user_like ON recipe.id = user_like.recipe_id WHERE user_like.user_id = ?",
    selectAllRecipe: "SELECT recipe.name, description, picture_id, video_id, price, recipe.id, category.name AS 'category' FROM gram_dev.recipe INNER JOIN category ON recipe.category_id = category.id",
    selectRecipePerCategory: "SELECT *, CASE WHEN EXISTS(select * from user_like where recipe_id = recipe.id) then 1 else 0 end as is_liked FROM recipe WHERE category_id = ?",
    selectRecipeNameID: "SELECT name, id FROM " + RECIPE_TABLE,
    selectFilteredRecipe:
        "SELECT DISTINCT recipe.name, description, picture_id, price, recipe.id, category_id, "
        + "CASE WHEN EXISTS(select * from user_like where recipe_id = recipe.id) then 1 else 0 end as is_liked "
        + "FROM recipe INNER JOIN recipe_filter ON recipe.id = recipe_filter.recipe_id "
        + "WHERE recipe.category_id = ? AND filter_id IN (?) GROUP BY `recipe_id` HAVING COUNT( * ) = ?",

    //INSERT
    insert: "INSERT INTO " + RECIPE_TABLE + " (name, category_id, description, price, video_id, picture_id) VALUES(?, ?, ?, ?, ?, ?)",
    insertLikedRecipe: "INSERT INTO " + USER_LIKE_TABLE + " (" + USER_LIKE_TABLE_USER_ID + "," + USER_LIKE_TABLE_RECIPE_ID + ") VALUES (?,?)",
    insertRecipe_instructions: "INSERT INTO " + "instruction" + " (recipe_id, instruction_rank, title, time, description) VALUES ?",
    insertRecipe_ingredients: "INSERT INTO " + "recipe_ingredient" + " (recipe_id, ingredient_id, quantity) VALUES ?",
    insertRecipe_pictures: "INSERT INTO " + "recipe_pictures" + " (recipe_id, picture_id) VALUES ?",
    insertRecipe_utensils: "INSERT INTO " + "recipe_utensil" + " (recipe_id, utensil_id) VALUES ?",
    insertRecipe_filters: "INSERT INTO " + "recipe_filter" + " (recipe_id, filter_id) VALUES ?",

    //DELETE
    delete : "DELETE FROM " + RECIPE_TABLE + " WHERE " + RECIPE_TABLE + ".id = ?",
    deleteLikedRecipe: "DELETE FROM " + USER_LIKE_TABLE + " WHERE " + USER_LIKE_TABLE_USER_ID + " = ? AND " + USER_LIKE_TABLE_RECIPE_ID + " = ?",

    //OTHER
    checkIfRecipeIsAlreadyLiked: "SELECT * from " + USER_LIKE_TABLE + " WHERE " + USER_LIKE_TABLE_USER_ID + " = ? AND " + USER_LIKE_TABLE_RECIPE_ID + " = ?",



    };

export const INGREDIENT_QUERIES = {
    selectAll: "SELECT * from ingredient",
    selectRecipe: "SELECT * from recipe where id = ? ",
    selectIngredientsFromRecipe: "SELECT id, name, quantity from ingredient INNER JOIN recipe_ingredient ON ingredient.id = recipe_ingredient.ingredient_id where recipe_ingredient.recipe_id = ? ",
};
