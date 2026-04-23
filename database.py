import csv
import sqlite3

# Connect tto SQLite database in the directory
conn = sqlite3.connect('project_batabase.db')
cursor = conn.cursor()


def insert_users():
    # to create the database table users
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        age INTEGER,
        country TEXT,
        age_group TEXT,
        region TEXT,
        customer_segment TEXT
    )
    ''')
    # emty users array
    users_data = []
    
    # helper function to make random ages for users 
    def get_age_group(age):
        if age <= 29: return '18-29'
        elif age <= 39: return '30-39'
        elif age <= 49: return '40-49'
        elif age <= 59: return '50-59'
        else: return '60+'
    
    # helper function to make random regions for users 
    # not sure if these are all the gulf countries
    def get_region(country):
        gulf = ['Qatar', 'UAE', 'Saudi Arabia', 'Kuwait', 'Bahrain', 'Oman']
        if country.strip() in gulf:
            return 'Gulf Region'
        else:
            return 'North Africa'
    
    # helper function to make the proper definition for users based on ages
    def get_life_stage(age):
        if age <= 29:
            return 'Young Adult' 
        if age <= 49:
            return 'Working Professional'
        # i forgot to put elif here but it still works i think
        if age <= 59:
            return 'Established Adult'
        else:
            return 'Senior'
    
    try:
        # open the csv file for users
        f = open('user.csv', 'r', encoding='utf-8-sig')
        reader = csv.reader(f)
        
        # skip the header row because it has column names not data
        header = next(reader)
        print("Users header: " + str(header))
        
        for row in reader:
            if len(row) >= 3:
                # get id , age ,country from csv files 
                # row[0] is id, row[1] is age, row[2] is country 
                user_id = int(row[0].strip())
                age = int(row[1].strip())
                country = row[2].strip()
                
                # add extra informations to users
                # these are the calculated columns
                age_group = get_age_group(age)
                region = get_region(country)
                customer_segment = get_life_stage(age)
                
                # append to database 
                users_data.append((user_id, age, country, age_group, region, customer_segment))
        
        
        if users_data:
            # execute insertion of users to users table and commit
            for user in users_data:
                cursor.execute('''
                    INSERT OR REPLACE INTO users 
                    (user_id, age, country, age_group, region, customer_segment) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', user)
            conn.commit()
            print("Inserted " + str(len(users_data)) + " users")
        else:
            print("No users found")

    except Exception as e:
        print("something sent wrong: " + str(e))


def insert_products():
    # add a products table to database
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        product_id INTEGER PRIMARY KEY,
        category TEXT,
        price REAL,
        product_name TEXT,
        subcategory TEXT,
        cost REAL,
        margin REAL,
        price_tier TEXT,
        seasonality TEXT
    )
    ''')
    
    # now the same as with users some helper fucnctions to add extra informations to products
    products_data = []
    
    def get_price_tier(price):
        # this is based on the price ranges my teacher showed
        if price < 50:
            return 'Budget'
        if price < 100:
            return 'Economy'
        if price < 200:
            return 'Standard'
        if price < 500:
            return 'Premium'
        else:
            return 'Luxury'
    
    def get_seasonality(category):
        # some products are seasonal like toys for christmas
        if category == 'Toys' or category == 'Sports' or category == 'Books':
            return 'Seasonal'
        else:
            return 'Year-round'
    
    def get_product_name(category, product_id):
        # i had to make up names for the products because the csv only has ids
        names = {
            'Toys': ['Action Figure', 'Board Game', 'Doll', 'Lego Set', 'Puzzle', 'Stuffed Animal', 'Remote Control Car'],
            'Clothes': ['T-Shirt', 'Jeans', 'Jacket', 'Dress', 'Shirt', 'Sweater', 'Pants'],
            'Perfumes': ['Eau de Parfum', 'Cologne', 'Body Spray', 'Perfume Oil', 'Aftershave', 'Fragrance Mist'],
            'Sports': ['Soccer Ball', 'Basketball', 'Tennis Racket', 'Yoga Mat', 'Dumbbell', 'Running Shoes', 'Sports Bag'],
            'Home Appliances': ['Blender', 'Microwave', 'Toaster', 'Coffee Maker', 'Vacuum Cleaner', 'Air Fryer', 'Iron'],
            'Electronics': ['Headphones', 'Charger', 'Power Bank', 'USB Cable', 'Mouse', 'Keyboard', 'Speaker'],
            'Books': ['Novel', 'Textbook', 'Cookbook', 'Biography', 'Self-Help', 'Children Book', 'Science Book']
        }
        if category in names:
            category_names = names[category]
        else:
            # in case theres a category i didnt think of
            category_names = ['Standard Product', 'Basic Item', 'Premium Item', 'Deluxe Version']
        index = product_id % len(category_names)
        return category_names[index]
    
    def get_subcategory(category):
        # i made these up too, hope they make sense
        subcategories = {
            'Toys': ['Educational', 'Action', 'Puzzles', 'Dolls'],
            'Clothes': ['Men', 'Women', 'Kids', 'Accessories'],
            'Perfumes': ['Men', 'Women', 'Unisex', 'Premium'],
            'Sports': ['Outdoor', 'Indoor', 'Fitness', 'Team Sports'],
            'Home Appliances': ['Kitchen', 'Cleaning', 'Laundry', 'Heating/Cooling'],
            'Electronics': ['Audio', 'Mobile Accessories', 'Computer Accessories', 'Cables'],
            'Books': ['Fiction', 'Non-Fiction', 'Educational', 'Children']
        }
        if category in subcategories:
            cat_sub = subcategories[category]
        else:
            cat_sub = ['General']
        # this is bad but i dont know a better way
        # i need a random number but consistent for the same category
        import hashlib
        hash_val = int(hashlib.md5(category.encode()).hexdigest(), 16)
        return cat_sub[hash_val % len(cat_sub)]
    
    try:
        f = open('product.csv', 'r', encoding='utf-8-sig')
        reader = csv.reader(f)
        header = next(reader)
        print("Products header: " + str(header))
        
        for row in reader:
            if len(row) >= 3:
                product_id = int(row[0].strip())
                category = row[1].strip()
                price = float(row[2].strip())
                
                # calculate all the extra fields
                product_name = get_product_name(category, product_id)
                subcategory = get_subcategory(category)
                cost = price * 0.6  # assuming 60% cost, is that realistic?
                cost = round(cost, 2)
                if price > 0:
                    margin = ((price - cost) / price) * 100
                    margin = round(margin, 2)
                else:
                    margin = 0
                price_tier = get_price_tier(price)
                seasonality = get_seasonality(category)
                
                products_data.append((product_id, category, price, product_name, subcategory, cost, margin, price_tier, seasonality))
        
        f.close()
        
        if products_data:
            for product in products_data:
                cursor.execute('''
                    INSERT OR REPLACE INTO products 
                    (product_id, category, price, product_name, subcategory, cost, margin, price_tier, seasonality) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', product)
            conn.commit()
            print("Inserted " + str(len(products_data)) + " products")
        else:
            print("No products found in product.csv")
            
    except Exception as e:
        print("Error: " + str(e))

def insert_ratings():
    # ratings table links users and products with a rating score
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS ratings (
        rating_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER,
        rating INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    )
    ''')
    
    ratings_data = []
    
    try:
        f = open('rating.csv', 'r', encoding='utf-8-sig')
        reader = csv.reader(f)
        header = next(reader)
        
        for row in reader:
            if len(row) >= 3:
                user_id = int(row[0].strip())
                product_id = int(row[1].strip())
                rating = int(row[2].strip())
                # rating should be 1-5 but i trust the csv file
                
                ratings_data.append((user_id, product_id, rating))
        
        f.close()
        
        if ratings_data:
            for rating in ratings_data:
                cursor.execute('''
                    INSERT OR REPLACE INTO ratings 
                    (user_id, product_id, rating) 
                    VALUES (?, ?, ?)
                ''', rating)
            conn.commit()
            print("Inserted " + str(len(ratings_data)) + " ratings")
        else:
            print("No ratings found in rating.csv")
            
    except Exception as e:
        print("something went worng: " + str(e))


def insert_behavior():
    # this table tracks what users do with products
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_behavior (
        behavior_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER,
        viewed INTEGER,
        clicked INTEGER,
        purchased INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    )
    ''')
    
    behavior_data = []
    
    try:
        f = open('behavior.csv', 'r', encoding='utf-8-sig')
        reader = csv.reader(f)
        header = next(reader)
        print("Behavior header: " + str(header))
        
        for row in reader:
            if len(row) >= 5:
                user_id = int(row[0].strip())
                product_id = int(row[1].strip())
                viewed = int(row[2].strip())
                clicked = int(row[3].strip())
                purchased = int(row[4].strip())
                # these are 0 or 1 
                
                behavior_data.append((user_id, product_id, viewed, clicked, purchased))
        
        
        if behavior_data:
            for behavior in behavior_data:
                cursor.execute('''
                    INSERT OR REPLACE INTO user_behavior 
                    (user_id, product_id, viewed, clicked, purchased) 
                    VALUES (?, ?, ?, ?, ?)
                ''', behavior)
            conn.commit()
            print("Inserted " + str(len(behavior_data)) + " behavior records")
        else:
            print("No behavior data found in behavior.csv")
            
    except Exception as e:
        print("something went wrong: " + str(e))

insert_users()
insert_products()
insert_ratings()
insert_behavior()

# Get counts to make sure it worked wright
cursor.execute("SELECT COUNT(*) FROM users")
user_count = cursor.fetchone()[0]

print("Total users: " + str(user_count))

conn.close()

print("Done!")
# finally done! this took me like 3 hours to write
