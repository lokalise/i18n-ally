import { commands } from 'vscode'
import { ExtensionModule } from '../modules'
import { Commands } from './commands'
import { TranslateKeys, OpenKey, CopyKey, RenameKey, DeleteKey, NewKey, FulfillKeys, DuplicateKey, EditKey, markKeyInUse, InsertKey } from './manipulations'
import { ReplaceText } from './manipulations/replaceText'

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.copy_key, CopyKey),
    commands.registerCommand(Commands.translate_key, TranslateKeys),
    commands.registerCommand(Commands.open_key, OpenKey),
    commands.registerCommand(Commands.rename_key, RenameKey),
    commands.registerCommand(Commands.edit_key, EditKey),
    commands.registerCommand(Commands.delete_key, DeleteKey),
    commands.registerCommand(Commands.fulfill_keys, FulfillKeys),
    commands.registerCommand(Commands.new_key, NewKey),
    commands.registerCommand(Commands.duplicate_key, DuplicateKey),
    commands.registerCommand(Commands.mark_key_as_in_use, markKeyInUse),
    commands.registerCommand(Commands.insert_key, InsertKey),
    commands.registerCommand(Commands.replace_with, ReplaceText),
  ]
}

export default m
