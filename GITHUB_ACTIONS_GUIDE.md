# GitHub Actions Auto Commit

Dự án này sử dụng GitHub Actions để tự động commit lên repository mỗi 3 tiếng.

## 🚀 Cách hoạt động

### Schedule

- **Cron**: `0 */3 * * *` (mỗi 3 tiếng)
- **Thời gian**: 0h, 3h, 6h, 9h, 12h, 15h, 18h, 21h UTC
- **Timezone**: UTC (Coordinated Universal Time)

### Quy trình

1. **Checkout** repository với full history
2. **Configure Git** với thông tin user
3. **Get current datetime** để tạo timestamp
4. **Update activity.log** với dòng mới
5. **Check for changes** - nếu không có thay đổi thì skip
6. **Commit** với message chuẩn conventional commits
7. **Push** lên branch main

## 📝 Commit Format

```
chore: auto update 2024-01-15 12:00
```

### Activity Log Format

```
Update: 2024-01-15 12:00:00 UTC
```

## ⚙️ Cấu hình

### Git User

- **Name**: `Tien2003deptrai`
- **Email**: `duongvantiendtu@gmail.com`

### Permissions

Workflow sử dụng `GITHUB_TOKEN` mặc định với quyền:

- `contents: write` - để commit và push
- `actions: read` - để đọc workflow

## 🔧 Tính năng

### ✅ Đã implement

- ✅ Chạy mỗi 3 tiếng theo cron schedule
- ✅ Append timestamp vào `activity.log`
- ✅ Commit message theo conventional commits
- ✅ Skip commit nếu không có thay đổi
- ✅ Configure git user tự động
- ✅ Push lên branch main
- ✅ Workflow dispatch (chạy thủ công)

### 🎯 Lợi ích

1. **Duy trì hoạt động** của repository
2. **Commit history** đều đặn và professional
3. **Activity tracking** với timestamp chính xác
4. **Không spam** - chỉ commit khi có thay đổi
5. **Tuân theo chuẩn** conventional commits

## 🚨 Lưu ý

### Requirements

- Repository phải được push lên GitHub
- Branch `main` phải tồn tại
- GitHub Actions phải được enable

### Troubleshooting

- Nếu workflow fail, check GitHub Actions tab
- Đảm bảo `GITHUB_TOKEN` có đủ quyền
- Check cron syntax nếu schedule không chạy

## 📊 Monitoring

### GitHub Actions Tab

- Xem lịch sử chạy workflow
- Debug logs nếu có lỗi
- Manual trigger workflow

### Activity Log

- File `activity.log` sẽ được cập nhật mỗi 3 tiếng
- Format: `Update: YYYY-MM-DD HH:MM:SS UTC`
- Có thể dùng để track repository activity

## 🎮 Manual Trigger

Để chạy workflow thủ công:

1. Vào GitHub repository
2. Click tab **Actions**
3. Chọn workflow **Daily Auto Commit**
4. Click **Run workflow**
5. Click **Run workflow** button
