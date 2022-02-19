const mongoose = require('mongoose');

const ToDoSchema = new mongoose.Schema({
    value: String,  // 할 일
    doneAt: Date,   // 완료된 시간
    order: Number,  // 할 일 순서
});

ToDoSchema.virtual("toDoId").get(function () {
    return this._id.toHexString();
});
ToDoSchema.set("toJSON", {
    virtuals: true,
});

module.exports = mongoose.model("ToDo", ToDoSchema);