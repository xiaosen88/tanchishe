import { COLS, ROWS } from './constants.js';

export class Collision {
    static checkWallCollision(snake) {
        const head = snake.getHead();
        return head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
    }

    static checkFoodCollision(snake, food) {
        const head = snake.getHead();
        const foodPos = food.getPosition();
        return head.x === foodPos.x && head.y === foodPos.y;
    }

    static checkSelfCollision(snake) {
        return snake.checkSelfCollision();
    }

    static isPositionValid(x, y, snake) {
        // 检查位置是否在蛇身上
        const body = snake.getBody();
        for (let segment of body) {
            if (segment.x === x && segment.y === y) {
                return false;
            }
        }
        return true;
    }
}
