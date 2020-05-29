const Quiz = require('../models/Quiz');
const User = require('../models/User');

// index, show, store, update, destroy

function validateTime(strTime) {
    if (strTime.length===5) { // 1 min ou 2 min
        return parseInt(strTime.slice(0));
    } else if (strTime.length===6) { //10 min ou 15 min ou 30 min
        return parseInt(strTime.slice(0, 2));
    } else if (strTime.length===8) { // 1:30 min ou 2:30 min
        if (strTime==='1:30 min') return 1.5;
        if (strTime==='2:30 min') return 2.5;
    } else throw Error('Time not valid');
}

module.exports = {
    async index(req, res) {
        try {
            const { page=1, category=null, author=null } = req.query;
            
            let query = {};
            if (category) query = { category };
            if (author) query = { ...query, author }

            const quizzes = await Quiz.paginate(query, {
                page,
                limit: 8,
                select: 'quizTitle category author tags questionsLength',
                populate: {
                    path: 'author',
                    select: 'userName'
                }
            });            
            
            return res.json({ quizzes, });
        } catch (err){
            console.log(err);
            
            return res.status(400).send({ error: "Não foi possível listar os Quizzes. Tente novamente." });
        }
    },

    async store(req, res) {
        try {
            const { quizTitle, category, private, questions, time } = req.body;  
            const userId = req.userId;
            const questionsLength = questions.length;
            
            const validatedTime = validateTime(time);

            const quiz = await Quiz.create({
                quizTitle, 
                category, 
                private, 
                questions,
                questionsLength,
                time: validatedTime,
                author: userId,
            });
            
            return res.send({ quiz });
        } catch (err) {
            console.log(err);
            
            return res.status(400).send({ error: "Não foi possível cadastrar o Quiz. Tente novamente." });
        }
    },

    async show(req, res) {
        const id = req.params.id;

        try {
            const quiz = await Quiz.findById(id).populate({
                path: 'author',
                model: 'User',
                select: 'userName'
            });
            
            if (!quiz)
                return res.status(404).send({ error: "Nenhum quiz cadastrado com esse id" });

            return res.send({ quiz });
        } catch (err) {
            return res.status(400).send({ error: "Não foi possível buscar as informações do Quiz. Tente novamente." });
        }
    },
}