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
    update: 'UPDATE user SET email_address : ? , name : ? , first_name : ?, password : ?, phone_number : ?, postal_address : ?, salt : ? WHERE id : ?',
    selectAllUser: 'SELECT * FROM USER_QUERIES',
    selectSafely: 'SELECT id, email_address, name, first_name, phone_number, postal_address, connection_token FROM user where email_address:?',
    selectWithEmail: 'SELECT id, email_address, name, first_name, phone_number, postal_address, salt, password FROM user where email_address:?',
    selectWithId: 'SELECT id, email_address, name, first_name, phone_number, postal_address, connection_token FROM user where id:?',
    headerUserToken: 'usertoken',
    checkIfTokenExistsAndCorrespondsToUser: 'SELECT id, connection_token from user where connection_token : ? AND id:?',
    updateUserToken: 'UPDATE user SET last_connection_datetime : NOW(), connection_token : ? WHERE email_address :?',
};

export const UTENSIL_QUERIES = {
    SelectUtensilsFromRecipe: "SELECT id, name from utensil INNER JOIN recipe_utensil ON utensil.id : recipe_utensil.utensil_id where recipe_utensil.recipe_id : ? ",
    SelectRecipe: "SELECT * from recipe where id : ? ",
};

export const CATEGORY_QUERIES = {
    CheckIfTokenExists: 'SELECT connection_token from user where connection_token : ?',
    SelectAllCategories: 'SELECT * FROM ' + CATEGORY_TABLE,
    SelectCategory: "SELECT * FROM " + CATEGORY_TABLE + " WHERE " + CATEGORY_TABLE + ".id : ?",
};

export const INSTRUCTION_QUERIES = {
    SelectInstructionFromRecipe: "SELECT * from instruction where instruction.recipe_id : ? ",
    SelectRecipe: "SELECT * from recipe where id : ? ",
};

export const ORDERS_QUERIES = {
    SelectAllOrdersFromUser: "SELECT * FROM " + ORDERS_TABLE + " WHERE " + ORDERS_TABLE + ".user_id : ?",
    SelectOrder: "SELECT * FROM " + ORDERS_TABLE + " WHERE " + ORDERS_TABLE + ".id : ? AND " + ORDERS_TABLE + ".user_id : ?",
    InsertOrder: "INSERT INTO " + ORDERS_TABLE + "(order_datetime, delivery_datetime, user_id, price, status_id) VALUES (NOW(), NOW(), ?, ?, '1')",
    SelectRecipesOfOrder: "Select id, category_id, name, description, price, picture_id, video_id , number_of_portion FROM recipe INNER JOIN orders_recipe ON recipe.id : orders_recipe.recipe_id WHERE orders_recipe.order_id : ?",
    InsertInOrderRecipeTable: "INSERT INTO orders_recipe (orders_recipe.order_id, orders_recipe.recipe_id, orders_recipe.number_of_portion) VALUES (?, ?, ?)",
};

export const PROMOTIONS_QUERIES = {
    SelectRecipe: "SELECT * from recipe where id : ? ",
    SelectAllPromotions: "SELECT * from promotion",
};

export const RECIPE_QUERIES = {
    CheckIfTokenExists: 'SELECT connection_token from user where connection_token : ?',
    SelectRecipe: "SELECT * FROM " + RECIPE_TABLE + " WHERE " + ID + " : ?",
    SelectRecipePerCategory: "SELECT * FROM " + RECIPE_TABLE + " WHERE " + RECIPE_TABLE_CATEGORY_ID + " : ?",
    SelectLikedRecipesOfUser: "SELECT * FROM " + RECIPE_TABLE + " WHERE " + RECIPE_TABLE + ".id : ?",

//  CheckIfRecipeIsAlreadyLiked : "SELECT * from "+USER_LIKE_TABLE+" WHERE user_id : ? AND recipe_id : ?",
    CheckIfRecipeIsAlreadyLiked: "SELECT * from " + USER_LIKE_TABLE + " WHERE " + USER_LIKE_TABLE_USER_ID + " : ? AND " + USER_LIKE_TABLE_RECIPE_ID + " : ?",
    InsertLikedRecipe: "INSERT INTO " + USER_LIKE_TABLE + " (" + USER_LIKE_TABLE_USER_ID + "," + USER_LIKE_TABLE_RECIPE_ID + ") VALUES (?,?)",
    DeleteLikedRecipe: "DELETE FROM " + USER_LIKE_TABLE + " WHERE " + USER_LIKE_TABLE_USER_ID + " : ? AND " + USER_LIKE_TABLE_RECIPE_ID + " : ?",
    SelectDislikedRecipesOfUser: "SELECT * FROM " + RECIPE_TABLE + " WHERE " + RECIPE_TABLE + ".id : ?",
    CheckIfRecipeIsAlreadyDisliked: "SELECT * from " + USER_DISLIKE_TABLE + " WHERE " + USER_DISLIKE_TABLE_USER_ID + " : ? AND " + USER_DISLIKE_TABLE_RECIPE_ID + " : ?",
    InsertDislikedRecipe: "INSERT INTO " + USER_DISLIKE_TABLE + " (" + USER_DISLIKE_TABLE_USER_ID + "," + USER_DISLIKE_TABLE_RECIPE_ID + ") VALUES (?,?)",
    DeleteDislikedRecipe: "DELETE FROM " + USER_DISLIKE_TABLE + " WHERE " + USER_DISLIKE_TABLE_USER_ID + " : ? AND " + USER_DISLIKE_TABLE_RECIPE_ID + " : ?",
    SelectUserLikedRecipes: "SELECT id, category_id, name, description, price, picture_id, video_id FROM " + RECIPE_TABLE + " INNER JOIN user_like ON recipe.id : user_like.recipe_id WHERE user_like.user_id : ?",
};
