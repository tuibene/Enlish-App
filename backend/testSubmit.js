const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: '60d0fe4f5311236168a109ca' }, 'super_secret_jwt_key_for_development', { expiresIn: '30d' });

fetch('http://localhost:5000/api/exams/69a830c91b5f7c8a3f826ed6/submit', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        answers: [
            {
                questionId: '69a830c91b5f7c8a3f826ed7',
                selectedOptionIndex: null,
                textAnswer: "This is a test essay answering the prompt. On the other hand, punishment alone..."
            }
        ]
    })
})
    .then(res => res.json())
    .then(console.log)
    .catch(console.error);
