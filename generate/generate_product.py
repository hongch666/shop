from faker import Faker
import random
import json
from datetime import datetime

# 初始化 Faker 实例
fake = Faker()

# 用来存储已经生成的 product_name
used_product_names = set()

def generate_random_product(i):
    # 保证生成唯一的 product_name
    while True:
        product_name = fake.word().capitalize() + ' ' + fake.word().capitalize()
        if product_name not in used_product_names:
            used_product_names.add(product_name)
            break

    product = {
        'product_id': i,
        'product_name': product_name,
        'price': round(random.uniform(10, 1000), 2),  # 随机价格，范围为 10 到 1000
        'description': fake.sentence(nb_words=10),  # 随机生成的商品描述
        'category_id': random.randint(1, 10),
        'create_time': datetime.now().isoformat(),
        'update_time': datetime.now().isoformat()
    }
    return product

insert_list = []

# 生成多个商品
for i in range(100000):
    insert_list.append(generate_random_product(i + 1))

# 导出为 JSON 文件
with open('products.json', 'w') as json_file:
    json.dump(insert_list, json_file, indent=4)
