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

// [API] 투두 목록 조회
router.get("/todos", async (req, res) => {
    const todos = await ToDo.find({}).sort("-order").exec();

    res.send({ todos });
})

// [API] 투두 아이템 생성
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

// [API] 투두 아이템 순서 변경
router.patch("/todos/:toDoId", async (req, res) => {
    // 1. toDoId, order 입력값 불러오기 [v]
    // 2. toDoId로 수정하려는 투두 아이템(currentToDo) 찾기 [v]
    // 3. 입력받은 order로 기존 투두 아이템(targetToDo) 찾기 [v]
    // 4. targetToDo의 순서를 currentToDo의 순서로 선언 & 저장
    // 5. currentToDo의 순서를 입력받은 order로 선언 & 저장
    // 6. 응답 리턴

    console.log("*** 순서 변경 시작 ***");

    const { toDoId } = req.params;
    const { order } = req.body;

    const switchingToDo = await ToDo.findOne({ _id: toDoId }).exec();
    if (!switchingToDo) {
        throw new Error("존재하지 않는 todo 데이터입니다.");
    }

    if (order) {
        const switchedToDo = await ToDo.findOne({ order }).exec();
        if (switchedToDo) {
            console.log(`변경 전 switchingToDo: ${switchingToDo.value} @ ${switchingToDo.order}`);
            console.log(`변경 전 switchedToDo: ${switchedToDo.value} @ ${switchedToDo.order}`);
            switchedToDo.order = switchingToDo.order;
            await switchedToDo.save();
            console.log(`변경 후 switchedToDo: ${switchedToDo.value} @ ${switchedToDo.order}`);
        }
        switchingToDo.order = order;
    };
    await switchingToDo.save();
    console.log(`변경 후 switchingToDo: ${switchingToDo.value} @ ${switchingToDo.order}`);
    console.log("*** 순서 변경 완료 ***");
    res.send({});
});

// [API] 투두 아이템 삭제
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

    // await ToDo.deleteOne({ _id: toDoId });
});