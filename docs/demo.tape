# VHS tape (https://github.com/charmbracelet/vhs) for the README demo.
# Render with: vhs docs/demo.tape
Output docs/demo.gif

Set FontSize 16
Set Width 1200
Set Height 700
Set Theme "Catppuccin Mocha"

Type "npx @appsforgood/next-supabase-kit init --stack next-supabase"
Enter
Sleep 6s

Type "npx @appsforgood/next-supabase-kit audit"
Enter
Sleep 6s

Type "npx @appsforgood/next-supabase-kit update --dry-run"
Enter
Sleep 5s
