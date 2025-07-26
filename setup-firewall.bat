@echo off
echo Настройка брандмауэра для Live Server...
echo.
echo Добавляем правило для порта 5500...
netsh advfirewall firewall add rule name="Live Server Port 5500 - Incoming" dir=in action=allow protocol=TCP localport=5500

echo.
echo Добавляем правило для порта 8080...
netsh advfirewall firewall add rule name="Simple Server Port 8080 - Incoming" dir=in action=allow protocol=TCP localport=8080

echo.
echo Готово! Правила брандмауэра добавлены.
echo.
echo Теперь попробуйте открыть на телефоне:
echo http://192.168.32.2:5500/trhrth-main/index.html
echo.
pause
