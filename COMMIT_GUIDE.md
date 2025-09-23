# Commit Chuẩn

Dự án này đã được cấu hình với **Husky + Commitlint + Commitizen** để đảm bảo commit messages tuân theo chuẩn [Conventional Commits](https://www.conventionalcommits.org/).

## Cách sử dụng

### 1. Commit với Commitizen (Khuyến nghị)

```bash
npm run commit
```

Lệnh này sẽ mở interactive prompt để bạn chọn:

- **Type**: loại thay đổi (feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert)
- **Scope**: phạm vi thay đổi (tùy chọn)
- **Description**: mô tả ngắn gọn
- **Body**: mô tả chi tiết (tùy chọn)
- **Footer**: breaking changes hoặc issues (tùy chọn)

### 2. Commit thủ công

Nếu bạn muốn commit thủ công, hãy tuân theo format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Các loại commit (Types)

| Type       | Mô tả                              | Ví dụ                                    |
| ---------- | ---------------------------------- | ---------------------------------------- |
| `feat`     | Tính năng mới                      | `feat: add user authentication`          |
| `fix`      | Sửa lỗi                            | `fix: resolve login validation error`    |
| `docs`     | Cập nhật tài liệu                  | `docs: update API documentation`         |
| `style`    | Format code, không ảnh hưởng logic | `style: fix code formatting`             |
| `refactor` | Refactor code                      | `refactor: simplify user service`        |
| `perf`     | Cải thiện performance              | `perf: optimize database queries`        |
| `test`     | Thêm/sửa tests                     | `test: add unit tests for auth`          |
| `chore`    | Cập nhật build tools, dependencies | `chore: update dependencies`             |
| `ci`       | Cập nhật CI/CD                     | `ci: add GitHub Actions workflow`        |
| `build`    | Thay đổi build system              | `build: update webpack config`           |
| `revert`   | Revert commit                      | `revert: revert "feat: add new feature"` |

## Cấu hình

### Husky Hooks

- **pre-commit**: Chạy `npm run format:check` trước khi commit
- **commit-msg**: Validate commit message với Commitlint

### Commitlint Rules

- Sử dụng conventional config
- Tối đa 100 ký tự cho header
- Subject phải lowercase
- Không kết thúc bằng dấu chấm

## Ví dụ commit messages

### Đúng

```
feat(auth): add JWT token validation
fix(api): handle null response in user service
docs: update installation guide
style: fix ESLint warnings
refactor(db): simplify connection logic
perf(queries): optimize user search
test(auth): add login test cases
chore: update dependencies
```

### Sai

```
added new feature
FIX: bug in login
Update docs
style fix
```

## Lợi ích

1. **Tự động generate changelog** từ commit messages
2. **Dễ dàng track changes** theo từng loại
3. **Consistent commit history** trong team
4. **Tự động validate** commit format
5. **Professional development workflow**

## Lưu ý

- Commit messages sẽ bị reject nếu không tuân theo format
- Pre-commit hook sẽ check code formatting
- Sử dụng `npm run commit` để có trải nghiệm tốt nhất
