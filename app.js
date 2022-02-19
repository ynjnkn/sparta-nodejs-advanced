// Dependencies
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Create an Express Application
const app = express();
const port = 8080;
const router = express.Router();
app.listen(port, () => {
    console.log(`서버 실행 @ 포트 ${port}`);
})

// Models
const ToDo = require("./models/toDo");

// MongoDB Settings
mongoose.connect("mongodb://localhost/todo-demo", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

// Middlewares
app.use("/api", bodyParser.json(), router);
app.use(express.static('./assets'));


router.get("/", (req, res) => {
    res.send("");
});

// [API] 할 일 목록 조회
router.get("/todos", async (req, res) => {
    const todos = await ToDo.find({}).sort("-order").exec();

    res.send({ todos });
})

// [API] 할 일 아이템 생성
router.post("/todos", async (req, res) => {
    const { value } = req.body;
    const maxOrderToDo = await ToDo.findOne().sort("-order").exec();
    let order = 1;
    if (maxOrderToDo) {
        order = maxOrderToDo.order + 1;
    };
    const toDo = new ToDo({ value, order });
    await toDo.save();

    res.send({ toDo });
});

// [API] 할 일 아이템 수정 (완료 여부, 값, 순서 변경 가능)
router.patch("/todos/:todoId", async (req, res) => {
    const { todoId } = req.params;
    const { order, value, done } = req.body;

    const todo = await ToDo.findById(todoId).exec();

    if (order) {
        const targetTodo = await ToDo.findOne({ order }).exec();
        if (targetTodo) {
            targetTodo.order = todo.order;
            await targetTodo.save();
        }
        todo.order = order;
    } else if (value) {
        todo.value = value;
    } else if (done !== undefined) {
        todo.doneAt = done ? new Date() : null;
    }

    await todo.save();

    res.send({});
});

// [API] 할 일 아이템 삭제
router.delete("/todos/:toDoId", async (req, res) => {
    // 1. 삭제하려는 투두 아이템의 ID를 URL에서 가져오기
    // 2. DB에서 해당 아이디의 오브젝트 찾기
    // 3. 삭제

    const { toDoId } = req.params;
    ToDo.deleteOne({ _id: toDoId }, (err) => {
        if (err) {
            console.log(`투두 아이템 ${toDoId} 삭제 실패`);
        }
        // console.log(`투두 아이템 ${toDoId} 삭제 성공`);
        // console.log(`투두 아이템 ${toDoId} 삭제 성공`);
        res
            // .send({});
            .json({
                msg: `투두 아이템 ${toDoId} 삭제 성공`,
            })
    });

    // await ToDo.deleteOne({ _id: toDoId }).exec();
});