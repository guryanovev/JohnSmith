/// <reference path="../Common.ts"/>

module JohnSmith.Command {
    export interface ICommand {
        execute(data: any[]):void;
    }

    export interface ICommandCause extends Common.IDisposable {
        wireWith(command:ICommand):void;
    }

    export interface ICommandBindingData {
        command: any;
        commandContext?: any;
        context: Common.IElement;
        causeData: any[];
    }

    export interface ICommandHost {
        on(...causeArguments: any[]): CommandConfig;
    }

    export interface ICommandArgumentsFetcher {
        fetch(target:Common.IElement): any[];
    }

    export class CommandWire implements Common.IDisposable {
        private _command: ICommand;
        private _cause: ICommandCause;

        constructor(command: ICommand, cause: ICommandCause){
            this._command = command;
            this._cause = cause;
        }

        public init(): void {
            this._cause.wireWith(this._command);
        }

        public dispose(): void {
            this._cause.dispose();
        }
    }

    export class CommandConfig implements Common.IDisposable {
        private _causeData: any[];
        private _commandManager: ICommandManager;
        private _context: Common.IElement;
        private _commandContext: any;
        private _wires: CommandWire[];

        constructor(causeData: any[], commandManager: ICommandManager, context: Common.IElement, commandContext?: any){
            this._causeData = causeData;
            this._commandManager = commandManager;
            this._context = context;
            this._commandContext = commandContext;
            this._wires = [];
        }

        public call(command: any, commandContext?: any): CommandConfig {
            var wire = this._commandManager.setUpBinding({
                command: command,
                context: this._context,
                causeData: this._causeData,
                commandContext: commandContext || this._commandContext || null
            });

            this._wires.push(wire);

            wire.init();
            return this;
        }

        public dispose(){
            for (var i = 0; i < this._wires.length; i++) {
                this._wires[i].dispose();
            }
        }
    }

    export interface ICommandManager {
        setUpBinding(data:ICommandBindingData): CommandWire;
    }
}