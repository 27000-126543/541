const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');

const {
  User,
  Medicine,
  Store,
  StoreMedicine,
  Doctor,
  Admin,
  Category,
  Promotion
} = require('../models');

async function seedData() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB connected');
    
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Medicine.deleteMany({}),
      Store.deleteMany({}),
      StoreMedicine.deleteMany({}),
      Doctor.deleteMany({}),
      Admin.deleteMany({}),
      Category.deleteMany({}),
      Promotion.deleteMany({})
    ]);
    
    console.log('Seeding categories...');
    const categories = await Category.insertMany([
      { name: '感冒咳嗽', code: 'cold_cough', level: 1, sort: 100, icon: '', medicineType: 'otc' },
      { name: '清热解毒', code: 'heat_clearing', level: 1, sort: 90, icon: '', medicineType: 'otc' },
      { name: '消化系统', code: 'digestive', level: 1, sort: 80, icon: '', medicineType: 'otc' },
      { name: '心脑血管', code: 'cardio', level: 1, sort: 70, icon: '', medicineType: 'prescription' },
      { name: '维生素保健', code: 'vitamin', level: 1, sort: 60, icon: '', medicineType: 'health' },
      { name: '医疗器械', code: 'medical_device', level: 1, sort: 50, icon: '', medicineType: 'medical_device' },
      { name: '皮肤用药', code: 'skin', level: 1, sort: 40, icon: '', medicineType: 'otc' },
      { name: '妇科用药', code: 'gynecology', level: 1, sort: 30, icon: '', medicineType: 'prescription' }
    ]);
    
    console.log('Seeding medicines...');
    const medicines = await Medicine.insertMany([
      {
        name: '感冒灵颗粒',
        genericName: '感冒灵颗粒',
        brand: '999',
        category: '感冒咳嗽',
        type: 'otc',
        specification: '10g*9袋',
        manufacturer: '三九医药股份有限公司',
        approvalNumber: '国药准字Z44021940',
        mainIngredients: ['三叉苦', '金盏银盘', '野菊花', '岗梅', '咖啡因', '对乙酰氨基酚', '马来酸氯苯那敏'],
        indications: '解热镇痛。用于感冒引起的头痛，发热，鼻塞，流涕，咽痛。',
        usageDosage: '开水冲服，一次1袋，一日3次。',
        price: 15.8,
        originalPrice: 19.8,
        coverImage: '',
        images: [],
        tags: ['感冒', '发烧', '头痛'],
        isHot: true,
        isRecommended: true,
        salesCount: 5680
      },
      {
        name: '布洛芬缓释胶囊',
        genericName: '布洛芬缓释胶囊',
        brand: '芬必得',
        category: '清热解毒',
        type: 'otc',
        specification: '0.3g*20粒',
        manufacturer: '中美天津史克制药有限公司',
        approvalNumber: '国药准字H10900089',
        mainIngredients: ['布洛芬'],
        indications: '用于缓解轻至中度疼痛如头痛、关节痛、偏头痛、牙痛、肌肉痛、神经痛、痛经。也用于普通感冒或流行性感冒引起的发热。',
        usageDosage: '口服。成人，一次1粒，一日2次（早晚各一次）。',
        price: 28.5,
        originalPrice: 32.0,
        coverImage: '',
        images: [],
        tags: ['止痛', '退烧', '头痛'],
        isHot: true,
        salesCount: 8920
      },
      {
        name: '阿莫西林胶囊',
        genericName: '阿莫西林胶囊',
        brand: '阿莫仙',
        category: '感冒咳嗽',
        type: 'prescription',
        specification: '0.25g*24粒',
        manufacturer: '珠海联邦制药股份有限公司',
        approvalNumber: '国药准字H44021518',
        mainIngredients: ['阿莫西林'],
        indications: '用于敏感菌所致的呼吸道感染、泌尿生殖道感染、皮肤软组织感染等。',
        usageDosage: '口服。成人一次0.5g，每6～8小时1次。',
        price: 25.0,
        coverImage: '',
        images: [],
        tags: ['抗生素', '消炎', '处方药'],
        isHot: true,
        salesCount: 4560
      },
      {
        name: '奥美拉唑肠溶胶囊',
        genericName: '奥美拉唑肠溶胶囊',
        brand: '洛赛克',
        category: '消化系统',
        type: 'prescription',
        specification: '20mg*14粒',
        manufacturer: '阿斯利康制药有限公司',
        approvalNumber: '国药准字H20030945',
        mainIngredients: ['奥美拉唑'],
        indications: '用于胃溃疡、十二指肠溃疡、应激性溃疡、反流性食管炎和卓-艾综合征。',
        usageDosage: '口服，一次20mg，一日1～2次。',
        price: 58.0,
        originalPrice: 65.0,
        coverImage: '',
        images: [],
        tags: ['胃病', '胃酸', '胃溃疡'],
        salesCount: 3200
      },
      {
        name: '维生素C片',
        genericName: '维生素C片',
        brand: '养生堂',
        category: '维生素保健',
        type: 'health',
        specification: '850mg*100片',
        manufacturer: '养生堂药业有限公司',
        approvalNumber: '国食健字G20050179',
        mainIngredients: ['维生素C', '樱桃粉'],
        indications: '补充维生素C，增强免疫力。',
        usageDosage: '每日1次，每次1片，嚼食。',
        price: 68.0,
        originalPrice: 88.0,
        coverImage: '',
        images: [],
        tags: ['维生素', '保健', '增强免疫力'],
        isHot: true,
        isRecommended: true,
        salesCount: 12500
      },
      {
        name: '电子血压计',
        genericName: '臂式电子血压计',
        brand: '欧姆龙',
        category: '医疗器械',
        type: 'medical_device',
        specification: 'HEM-7136',
        manufacturer: '欧姆龙健康医疗(中国)有限公司',
        approvalNumber: '粤械注准20152010170',
        mainIngredients: [],
        indications: '测量血压。',
        usageDosage: '请按照说明书使用。',
        price: 299.0,
        originalPrice: 399.0,
        coverImage: '',
        images: [],
        tags: ['血压计', '家用', '医疗器械'],
        isHot: true,
        salesCount: 1560
      },
      {
        name: '复方丹参滴丸',
        genericName: '复方丹参滴丸',
        brand: '天士力',
        category: '心脑血管',
        type: 'prescription',
        specification: '27mg*180丸',
        manufacturer: '天士力制药集团股份有限公司',
        approvalNumber: '国药准字Z10950111',
        mainIngredients: ['丹参', '三七', '冰片'],
        indications: '活血化瘀，理气止痛。用于气滞血瘀所致的胸痹，症见胸闷、心前区刺痛；冠心病心绞痛见上述证候者。',
        usageDosage: '口服或舌下含服，一次10丸，一日3次。',
        price: 65.0,
        coverImage: '',
        images: [],
        tags: ['心脏病', '冠心病', '心绞痛'],
        salesCount: 6780
      },
      {
        name: '葡萄糖酸钙口服溶液',
        genericName: '葡萄糖酸钙口服溶液',
        brand: '三精',
        category: '维生素保健',
        type: 'otc',
        specification: '10ml*12支',
        manufacturer: '哈药集团三精制药有限公司',
        approvalNumber: '国药准字H10890047',
        mainIngredients: ['葡萄糖酸钙'],
        indications: '用于预防和治疗钙缺乏症，如骨质疏松、手足抽搐症、骨发育不全、佝偻病以及儿童、妊娠和哺乳期妇女、绝经期妇女、老年人钙的补充。',
        usageDosage: '口服。一次10～20毫升，一日3次。',
        price: 25.8,
        coverImage: '',
        images: [],
        tags: ['补钙', '儿童', '液体钙'],
        isRecommended: true,
        salesCount: 4320
      },
      {
        name: '红霉素软膏',
        genericName: '红霉素软膏',
        brand: '恒健',
        category: '皮肤用药',
        type: 'otc',
        specification: '10g',
        manufacturer: '广东恒健制药有限公司',
        approvalNumber: '国药准字H44023928',
        mainIngredients: ['红霉素'],
        indications: '用于脓疱疮等化脓性皮肤病、小面积烧伤、溃疡面的感染和寻常痤疮。',
        usageDosage: '局部外用。取本品适量，涂于患处，一日2次。',
        price: 8.5,
        coverImage: '',
        images: [],
        tags: ['皮肤感染', '痤疮', '外用'],
        salesCount: 9870
      },
      {
        name: '连花清瘟胶囊',
        genericName: '连花清瘟胶囊',
        brand: '以岭',
        category: '感冒咳嗽',
        type: 'otc',
        specification: '0.35g*24粒',
        manufacturer: '石家庄以岭药业股份有限公司',
        approvalNumber: '国药准字Z20040063',
        mainIngredients: ['连翘', '金银花', '炙麻黄', '炒苦杏仁', '石膏', '板蓝根', '绵马贯众', '鱼腥草'],
        indications: '清瘟解毒，宣肺泄热。用于治疗流行性感冒属热毒袭肺证。',
        usageDosage: '口服。一次4粒，一日3次。',
        price: 22.0,
        coverImage: '',
        images: [],
        tags: ['流感', '感冒', '清热解毒'],
        isHot: true,
        isNew: true,
        salesCount: 15680
      },
      {
        name: '六味地黄丸',
        genericName: '六味地黄丸',
        brand: '同仁堂',
        category: '维生素保健',
        type: 'otc',
        specification: '9g*10丸',
        manufacturer: '北京同仁堂科技发展股份有限公司',
        approvalNumber: '国药准字Z11020056',
        mainIngredients: ['熟地黄', '山茱萸', '牡丹皮', '山药', '茯苓', '泽泻'],
        indications: '滋阴补肾。用于肾阴亏损，头晕耳鸣，腰膝酸软，骨蒸潮热，盗汗遗精。',
        usageDosage: '口服。大蜜丸一次1丸，一日2次。',
        price: 35.0,
        coverImage: '',
        images: [],
        tags: ['补肾', '滋阴', '中成药'],
        isRecommended: true,
        salesCount: 7890
      },
      {
        name: '复方甘草片',
        genericName: '复方甘草片',
        brand: '华中药业',
        category: '感冒咳嗽',
        type: 'prescription',
        specification: '100片',
        manufacturer: '华中药业股份有限公司',
        approvalNumber: '国药准字H42021787',
        mainIngredients: ['甘草浸膏粉', '阿片粉', '樟脑', '八角茴香油', '苯甲酸钠'],
        indications: '用于镇咳祛痰。',
        usageDosage: '口服或含化。成人一次3～4片，一日3次。',
        price: 12.0,
        coverImage: '',
        images: [],
        tags: ['止咳', '化痰', '处方药'],
        salesCount: 5670
      }
    ]);
    
    console.log('Seeding stores...');
    const stores = await Store.insertMany([
      {
        name: '中心旗舰店',
        code: 'STORE001',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        address: '科技园南区高新南一道1号',
        longitude: 113.95,
        latitude: 22.54,
        phone: '0755-88880001',
        businessHours: {
          weekdays: { open: '08:00', close: '22:00' },
          weekends: { open: '09:00', close: '21:00' }
        },
        manager: '张经理',
        managerPhone: '13800138001',
        type: 'flagship',
        level: 1,
        supportsDelivery: true,
        supportsPickup: true,
        deliveryRadius: 10,
        deliveryFee: 5,
        freeDeliveryAmount: 99,
        status: 'active'
      },
      {
        name: '福田分店',
        code: 'STORE002',
        province: '广东省',
        city: '深圳市',
        district: '福田区',
        address: '福华路123号',
        longitude: 114.06,
        latitude: 22.52,
        phone: '0755-88880002',
        businessHours: {
          weekdays: { open: '08:00', close: '22:00' },
          weekends: { open: '09:00', close: '21:00' }
        },
        manager: '李经理',
        managerPhone: '13800138002',
        type: 'standard',
        level: 2,
        supportsDelivery: true,
        supportsPickup: true,
        deliveryRadius: 5,
        deliveryFee: 5,
        freeDeliveryAmount: 68,
        status: 'active'
      },
      {
        name: '罗湖社区店',
        code: 'STORE003',
        province: '广东省',
        city: '深圳市',
        district: '罗湖区',
        address: '人民北路567号',
        longitude: 114.12,
        latitude: 22.55,
        phone: '0755-88880003',
        businessHours: {
          weekdays: { open: '07:30', close: '23:00' },
          weekends: { open: '08:00', close: '22:30' }
        },
        manager: '王经理',
        managerPhone: '13800138003',
        type: 'community',
        level: 3,
        supportsDelivery: true,
        supportsPickup: true,
        deliveryRadius: 3,
        deliveryFee: 3,
        freeDeliveryAmount: 49,
        status: 'active'
      },
      {
        name: '广州天河店',
        code: 'STORE004',
        province: '广东省',
        city: '广州市',
        district: '天河区',
        address: '天河路200号',
        longitude: 113.32,
        latitude: 23.13,
        phone: '020-88880004',
        businessHours: {
          weekdays: { open: '08:00', close: '22:00' },
          weekends: { open: '09:00', close: '21:00' }
        },
        manager: '陈经理',
        managerPhone: '13800138004',
        type: 'standard',
        level: 2,
        supportsDelivery: true,
        supportsPickup: true,
        deliveryRadius: 5,
        deliveryFee: 5,
        freeDeliveryAmount: 68,
        status: 'active'
      }
    ]);
    
    console.log('Seeding store medicines...');
    for (const store of stores) {
      const storeMedicines = medicines.map((med, index) => ({
        storeId: store._id,
        medicineId: med._id,
        stock: Math.floor(Math.random() * 200) + 50,
        availableStock: Math.floor(Math.random() * 200) + 50,
        lockedStock: 0,
        price: med.price * (0.95 + Math.random() * 0.1),
        isActive: true,
        batchInfo: [
          {
            batchNumber: `B${new Date().getFullYear()}${String(index + 1).padStart(3, '0')}`,
            productionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
            quantity: Math.floor(Math.random() * 200) + 50
          }
        ]
      }));
      
      await StoreMedicine.insertMany(storeMedicines);
    }
    
    console.log('Seeding doctors...');
    const doctors = await Doctor.insertMany([
      {
        name: '张医生',
        avatar: '',
        gender: 'male',
        department: 'internal',
        title: '主任医师',
        hospital: '深圳市人民医院',
        specialties: ['感冒发烧', '呼吸道疾病', '消化系统疾病'],
        introduction: '从事内科临床工作20年，擅长呼吸道、消化道常见病诊治。',
        consultationPrice: 30,
        videoPrice: 60,
        phonePrice: 50,
        consultationCount: 1580,
        goodRate: 98.5,
        averageRating: 4.9,
        reviewCount: 890,
        serviceStatus: 'online',
        isVerified: true,
        isRecommended: true
      },
      {
        name: '李医生',
        avatar: '',
        gender: 'female',
        department: 'pediatrics',
        title: '副主任医师',
        hospital: '深圳市儿童医院',
        specialties: ['小儿感冒', '小儿消化', '儿童保健'],
        introduction: '儿科临床经验15年，对儿童常见病有丰富诊治经验。',
        consultationPrice: 25,
        videoPrice: 50,
        phonePrice: 40,
        consultationCount: 2300,
        goodRate: 99.2,
        averageRating: 4.95,
        reviewCount: 1560,
        serviceStatus: 'online',
        isVerified: true,
        isRecommended: true
      },
      {
        name: '王医生',
        avatar: '',
        gender: 'male',
        department: 'dermatology',
        title: '主治医师',
        hospital: '深圳市第二人民医院',
        specialties: ['皮肤过敏', '湿疹', '痤疮'],
        introduction: '皮肤科专业10年，擅长各类皮肤病诊治。',
        consultationPrice: 20,
        videoPrice: 45,
        phonePrice: 35,
        consultationCount: 980,
        goodRate: 97.8,
        averageRating: 4.8,
        reviewCount: 650,
        serviceStatus: 'busy',
        isVerified: true
      },
      {
        name: '陈医生',
        avatar: '',
        gender: 'female',
        department: 'gynecology',
        title: '副主任医师',
        hospital: '深圳市妇幼保健院',
        specialties: ['妇科炎症', '月经不调', '孕期保健'],
        introduction: '妇产科临床经验18年，擅长妇科常见病诊治。',
        consultationPrice: 28,
        videoPrice: 55,
        phonePrice: 45,
        consultationCount: 1250,
        goodRate: 98.9,
        averageRating: 4.9,
        reviewCount: 780,
        serviceStatus: 'online',
        isVerified: true,
        isRecommended: true
      },
      {
        name: '刘医生',
        avatar: '',
        gender: 'male',
        department: 'tcm',
        title: '主任医师',
        hospital: '深圳市中医院',
        specialties: ['中医调理', '亚健康', '慢性病调理'],
        introduction: '中医临床30年，擅长中医辨证施治。',
        consultationPrice: 35,
        videoPrice: 70,
        phonePrice: 60,
        consultationCount: 890,
        goodRate: 99.5,
        averageRating: 4.98,
        reviewCount: 560,
        serviceStatus: 'offline',
        isVerified: true
      },
      {
        name: '赵医生',
        avatar: '',
        gender: 'female',
        department: 'pharmacy',
        title: '执业药师',
        hospital: '本连锁药房',
        specialties: ['用药咨询', '药物相互作用', '合理用药'],
        introduction: '执业药师，从事药学工作15年。',
        consultationPrice: 15,
        videoPrice: 30,
        phonePrice: 25,
        consultationCount: 3200,
        goodRate: 99.8,
        averageRating: 5,
        reviewCount: 2100,
        serviceStatus: 'online',
        isVerified: true,
        isRecommended: true
      }
    ]);
    
    console.log('Seeding promotions...');
    const promotions = await Promotion.insertMany([
      {
        name: '满减活动',
        type: 'full_reduction',
        description: '全场满减，多买多省',
        bannerImage: '',
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        rules: {
          fullReduction: {
            tiers: [
              { threshold: 59, discount: 5 },
              { threshold: 99, discount: 12 },
              { threshold: 199, discount: 30 },
              { threshold: 399, discount: 70 }
            ]
          }
        },
        minOrderAmount: 0,
        useCount: 5680
      },
      {
        name: '限时秒杀',
        type: 'flash_sale',
        description: '每日10点限时秒杀',
        bannerImage: '',
        startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        rules: {
          flashSale: {
            startTime: new Date(Date.now()),
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
            discountRate: 0.7,
            limitPerUser: 1
          }
        },
        applicableMedicines: [medicines[0]._id, medicines[1]._id, medicines[4]._id],
        useCount: 2340
      },
      {
        name: '新人专享',
        type: 'discount',
        description: '新用户首单9折优惠',
        bannerImage: '',
        startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'active',
        rules: {
          discount: {
            discountRate: 0.9
          }
        },
        maxDiscount: 20,
        useCount: 8900
      }
    ]);
    
    console.log('Seeding admin...');
    await Admin.create({
      username: 'admin',
      password: 'admin123',
      realName: '超级管理员',
      role: 'super_admin',
      phone: '13800000000',
      email: 'admin@pharmacy.com',
      status: 'active'
    });
    
    await Admin.create({
      username: 'pharmacist',
      password: '123456',
      realName: '张药师',
      role: 'pharmacist',
      phone: '13800000001',
      status: 'active'
    });
    
    await Admin.create({
      username: 'store_manager',
      password: '123456',
      realName: '门店经理',
      role: 'store_manager',
      storeId: stores[0]._id,
      phone: '13800000002',
      status: 'active'
    });
    
    console.log('Seeding test user...');
    await User.create({
      phone: '13800138000',
      password: '123456',
      nickname: '测试用户',
      gender: 'male',
      birthday: new Date('1990-01-01'),
      memberLevel: 'normal',
      memberPoints: 100,
      yearlyConsumption: 500,
      freeConsultationCount: 1,
      healthProfile: {
        allergies: ['青霉素'],
        chronicDiseases: ['高血压'],
        medicalHistory: ['阑尾炎手术'],
        bloodType: 'A'
      },
      familyMembers: [
        {
          name: '张小明',
          relation: '儿子',
          gender: 'male',
          birthday: new Date('2015-05-01'),
          allergies: [],
          chronicDiseases: [],
          medicalHistory: []
        }
      ],
      addresses: [
        {
          name: '张三',
          phone: '13800138000',
          province: '广东省',
          city: '深圳市',
          district: '南山区',
          detail: '科技园南区高新南一道1号1单元101室',
          isDefault: true
        }
      ],
      medicalInsurance: {
        cardNumber: 'SZ88888888',
        insuredCity: '深圳市',
        isBound: true,
        balance: 1500
      }
    });
    
    console.log('Seeding completed!');
    console.log('Test user: 13800138000 / 123456');
    console.log('Admin: admin / admin123');
    console.log('Pharmacist: pharmacist / 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
